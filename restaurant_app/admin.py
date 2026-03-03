
from django.contrib import admin
from .models import (
    Category,
    MenuItem,
    Table,
    Order,
    OrderItem,
    Payment,
    StaffProfile
)

admin.site.register(Category)
admin.site.register(MenuItem)
admin.site.register(Table)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)
admin.site.register(StaffProfile)
