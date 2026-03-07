from rest_framework import serializers
from restaurant_app.models import (
    Category,
    MenuItem,
    Order,
    OrderItem,
    Payment, Table
)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


        
class MenuItemSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            'id',
            'name',
            'price',
            'image',
            'category'
        ]


class MenuItemCreateSerializer(serializers.ModelSerializer):
    """For creating menu items: category is sent as id (e.g. from FormData)."""
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())

    class Meta:
        model = MenuItem
        fields = ['name', 'price', 'image', 'category']


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'menu_item',
            'quantity'
        ]



class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    table_number = serializers.IntegerField(
        source='table.table_number',
        read_only=True
    )

    class Meta:
        model = Order
        fields = [
            'id',
            'table_number',
            'status',
            'total_amount',
            'items',
            'created_at'
        ]



class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id',
            'order',
            'upi_reference',
            'amount',
            'status',
            'paid_at'
        ]
        read_only_fields = ['status', 'paid_at']



class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'table_number']
