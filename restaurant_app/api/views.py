from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework import status
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from restaurant_app.models import (
    Table, MenuItem, Order, OrderItem, StaffProfile, Category
)

from restaurant_app.api.serializers import (
    MenuItemSerializer,
    MenuItemCreateSerializer,
    OrderSerializer,
  TableSerializer, CategorySerializer, CategoryAdminSerializer, StaffSerializer,
)

from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # To not perform the csrf check previously happening

class TestAPIView(APIView):
    def get(self, request):
        return Response({"message": "API working"})


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([]) 
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
@authentication_classes([]) 
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



@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])  
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



@csrf_exempt
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


@ensure_csrf_cookie
@api_view(['GET'])
def get_csrf(request):
    return Response({"message": "CSRF cookie set"})



@api_view(['DELETE'])
def delete_menu_item(request, pk):
    # Only allow owner to delete menu items
    if not request.user.is_authenticated or request.user.staffprofile.role != "owner":
        return Response({"error": "Unauthorized"}, status=403)
    item = get_object_or_404(MenuItem, id=pk)
    item.delete()

    return Response({"message": "Item deleted"})


@api_view(['PATCH'])
def toggle_item(request, pk):
    if not request.user.is_authenticated or request.user.staffprofile.role != "owner":
        return Response({"error": "Unauthorized"}, status=403)
    item = get_object_or_404(MenuItem, id=pk)

    item.is_available = not item.is_available
    item.save()

    return Response({"is_available": item.is_available})


@api_view(['POST'])
@permission_classes([AllowAny])
def add_menu_item(request):
    serializer = MenuItemCreateSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        item = serializer.save()
        return Response(MenuItemSerializer(item).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET'])
@permission_classes([AllowAny])
def category_list(request):
    categories = Category.objects.filter(is_active=True)
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def category_list_all(request):
    if not request.user.is_authenticated or request.user.staffprofile.role != "owner":
        return Response({"error": "Unauthorized"}, status=403)

    categories = Category.objects.all().order_by("name")
    serializer = CategoryAdminSerializer(categories, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def add_category(request):
    if not request.user.is_authenticated or request.user.staffprofile.role != "owner":
        return Response({"error": "Unauthorized"}, status=403)

    name = (request.data.get("name") or "").strip()
    if not name:
        return Response({"error": "Category name is required"}, status=400)

    category, created = Category.objects.get_or_create(name=name)
    if not created and not category.is_active:
        category.is_active = True
        category.save(update_fields=["is_active"])

    return Response(
        CategoryAdminSerializer(category).data,
        status=201 if created else 200
    )


@api_view(['PATCH'])
def toggle_category(request, pk):
    if not request.user.is_authenticated or request.user.staffprofile.role != "owner":
        return Response({"error": "Unauthorized"}, status=403)

    category = get_object_or_404(Category, id=pk)
    category.is_active = not category.is_active
    category.save(update_fields=["is_active"])
    return Response(CategoryAdminSerializer(category).data)



@api_view(['GET'])
def staff_list(request):

    if not request.user.is_authenticated or request.user.staffprofile.role != "owner":
        return Response({"error": "Unauthorized"}, status=403)

    staff = StaffProfile.objects.select_related("user").all()

    serializer = StaffSerializer(staff, many=True)

    return Response(serializer.data)





@api_view(['POST'])
def add_staff(request):

    if not request.user.is_authenticated or request.user.staffprofile.role != "owner":
        return Response({"error": "Unauthorized"}, status=403)

    username = request.data.get("username")
    password = request.data.get("password")
    role = request.data.get("role")
    salary = request.data.get("salary")

    if not username or not password:
        return Response({"error": "Username and password required"}, status=400)

    user = User.objects.create_user(
        username=username,
        password=password
    )

    StaffProfile.objects.create(
        user=user,
        role=role,
        salary=salary
    )

    return Response({"message": "Staff created"})


@api_view(['DELETE'])
def delete_staff(request, pk):

    if not request.user.is_authenticated or request.user.staffprofile.role != "owner":
        return Response({"error": "Unauthorized"}, status=403)

    staff = get_object_or_404(StaffProfile, id=pk)

    staff.user.delete()

    return Response({"message": "Staff deleted"})


@api_view(['PATCH'])
def update_salary(request, pk):

    if not request.user.is_authenticated or request.user.staffprofile.role != "owner":
        return Response({"error": "Unauthorized"}, status=403)

    staff = get_object_or_404(StaffProfile, id=pk)

    salary = request.data.get("salary")

    staff.salary = salary
    staff.save()

    return Response({"message": "Salary updated"})






def order_bill(request, order_id):

    order = Order.objects.get(id=order_id)

    rows = ""

    for item in order.items.all():
        total = item.quantity * item.menu_item.price
        rows += f"{item.menu_item.name} x{item.quantity}    {total}<br>"

    html = f"""
    <html>
    <head>
    <title>Receipt</title>

    <style>
    body {{
        font-family: monospace;
        width: 280px;
        margin: auto;
    }}

    .center {{
        text-align: center;
    }}

    .line {{
        border-top: 1px dashed black;
        margin: 8px 0;
    }}

    </style>

    <script>
    window.onload = function() {{
        window.print();
    }}
    </script>

    </head>

    <body>

    <div class="center">
        <h3>My Restaurant</h3>
        Order #{order.id}<br>
        Table {order.table.table_number}
    </div>

    <div class="line"></div>

    {rows}

    <div class="line"></div>

    <b>TOTAL: ₹{order.total_amount}</b>

    <div class="line"></div>

    <div class="center">
        Thank You!<br>
        Visit Again
    </div>

    </body>
    </html>
    """

    return HttpResponse(html)


@api_view(['GET'])
def table_orders(request, table_id):

    orders = Order.objects.filter(table_id=table_id).order_by('-created_at')

    data = []

    for order in orders:
        data.append({
            "id": order.id,
            "status": order.status,
            "total_amount": order.total_amount,
            "created_at": order.created_at
        })

    return Response(data)

def create_admin(request):
    if not User.objects.filter(username="admin").exists():
        User.objects.create_superuser("admin", "admin@example.com", "1234")
        return HttpResponse("Admin created")
    return HttpResponse("Admin already exists")