from django.urls import path
from .views import TestAPIView, start_order, menu_list, add_item_to_order, order_detail, cancel_order, all_orders, \
    complete_order, CompleteOrderView, update_order_status, table_list, login_view, logout_view, check_auth, get_csrf, \
    delete_menu_item, toggle_item, add_menu_item, category_list, staff_list, add_staff, delete_staff, update_salary, \
    order_bill

urlpatterns = [
    path('test/', TestAPIView.as_view()),
    path('start-order/', start_order, name='start_order'),
    path('menu/', menu_list, name='menu_list'),
    path('add-item/', add_item_to_order, name='add_item_to_order'),
    path('order/<int:order_id>/', order_detail, name='order_detail'),
    path('cancel-order/<int:order_id>/', cancel_order, name='cancel_order'),
    path('complete-order/<int:order_id>/', complete_order, name='complete_order'),
    path('complete-order/<int:order_id>/', CompleteOrderView.as_view()),
    path('update-status/<int:order_id>/', update_order_status),
    path('all-orders/', all_orders, name='all_orders'),
    path('tables/', table_list),
    path('login/', login_view),
    path('logout/', logout_view),
    path('check-auth/', check_auth),
    path('get-csrf/', get_csrf),
    path("menu/delete/<int:pk>/", delete_menu_item),
    path("menu/toggle/<int:pk>/", toggle_item),
    path("menu/add/", add_menu_item),
    path('categories/', category_list),
    path("staff/", staff_list),
    path("staff/add/", add_staff),
    path("staff/delete/<int:pk>/", delete_staff),
    path("staff/salary/<int:pk>/", update_salary),
    path("order/<int:order_id>/bill/", order_bill),
]
