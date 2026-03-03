from django.contrib.auth import authenticate, login, logout
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from restaurant_app.models import (
    Table, MenuItem, Order, OrderItem, StaffProfile
)

from restaurant_app.api.serializers import (
    MenuItemSerializer,
    OrderSerializer, TableSerializer
)

class TestAPIView(APIView):
    def get(self, request):
        return Response({"message": "API working"})


@api_view(['POST'])
@permission_classes([AllowAny])
def start_order(request):
    table_id = request.data.get('table_id')

    if not table_id:
        return Response(
            {'error': 'Table ID is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    table = get_object_or_404(Table, id=table_id, is_active=True)

    order = Order.objects.create(table=table)

    serializer = OrderSerializer(order)

    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def menu_list(request):
    items = MenuItem.objects.filter(is_available=True)

    serializer = MenuItemSerializer(items, many=True)

    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def add_item_to_order(request):
    order_id = request.data.get('order_id')
    item_id = request.data.get('item_id')
    quantity = int(request.data.get('quantity', 1))  # 👈 ADD THIS

    if not order_id or not item_id:
        return Response(
            {'error': 'order_id and item_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    order = get_object_or_404(Order, id=order_id)
    item = get_object_or_404(MenuItem, id=item_id, is_available=True)

    order_item, created = OrderItem.objects.get_or_create(
        order=order,
        menu_item=item
    )

    if created:
        order_item.quantity = quantity   # 👈 SET quantity
    else:
        order_item.quantity += quantity  # 👈 ADD quantity

    order_item.save()

    # ✅ Recalculate total
    total = sum(
        i.menu_item.price * i.quantity
        for i in order.items.all()
    )

    order.total_amount = total
    order.save()

    return Response({
        'message': 'Item added successfully',
        'total_amount': order.total_amount
    })

    


@api_view(['POST'])
@permission_classes([AllowAny])
def cancel_order(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    if order.status != 'pending':
        return Response(
            {'error': 'Order cannot be cancelled now'},
            status=status.HTTP_400_BAD_REQUEST
        )

    order.status = 'cancelled'
    order.save()

    return Response({'message': 'Order cancelled'})


@api_view(['GET'])
@permission_classes([AllowAny])
def order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    serializer = OrderSerializer(order)

    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([AllowAny])
def all_orders(request):
    orders = Order.objects.exclude(status='paid').order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def complete_order(request, order_id):
    if not request.user.is_authenticated:
        return Response({"error": "Login required"}, status=401)

    if not check_role(request.user, ['chef']):
        return Response({"error": "Not allowed"}, status=403)

    order = get_object_or_404(Order, id=order_id)
    order.status = 'completed'
    order.save()

    return Response({"message": "Order completed"})


class CompleteOrderView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
            order.status = "paid"
            order.save()

            return Response({"message": "Order completed"})
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):

    if not check_role(request.user, ['chef']):
        return Response({'error': 'Unauthorized'}, status=403)

    order = get_object_or_404(Order, id=order_id)

    new_status = request.data.get('status')
    order.status = new_status
    order.save()

    return Response({'message': 'Status updated'})



@api_view(['GET'])
@permission_classes([AllowAny])
def table_list(request):
    tables = Table.objects.filter(is_active=True)
    serializer = TableSerializer(tables, many=True)
    return Response(serializer.data)




@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if not user:
        return Response({"error": "Invalid credentials"}, status=400)

    login(request, user)

    try:
        profile = StaffProfile.objects.get(user=user)
    except StaffProfile.DoesNotExist:
        return Response({"error": "No role assigned"}, status=400)

    return Response({
        "id": user.id,
        "username": user.username,
        "role": profile.role
    })





def check_role(user, allowed_roles):
    try:
        role = user.staffprofile.role
    except StaffProfile.DoesNotExist:
        return False

    return role in allowed_roles

@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    logout(request)
    return Response({"message": "Logged out"})




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth(request):
    return Response({
        "username": request.user.username,
        "role": request.user.staffprofile.role
    })

