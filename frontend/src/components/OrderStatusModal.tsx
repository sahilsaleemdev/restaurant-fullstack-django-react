type Props = {
    order: any;
    close: () => void;
    cancelOrder: () => void;
  };
  
  function OrderStatusModal({ order, close, cancelOrder }: Props) {
    if (!order) return null;
  
    return (
      <div className="modal-backdrop-custom">
  
        <div className="modal-box">
  
          <h4>Your Order</h4>
  
          <p>Order #{order.id}</p>
  
          <div className="alert alert-primary text-center">
            {order.status}
          </div>
  
          {order.items.map((item: any) => (
            <p key={item.id}>
              {item.menu_item.name} × {item.quantity}
            </p>
          ))}
  
          <h5>Total: ₹{order.total_amount}</h5>
  
          <button
            className="btn btn-danger w-100 mb-2"
            onClick={cancelOrder}
          >
            Cancel Order
          </button>
  
          <button
            className="btn btn-secondary w-100"
            onClick={close}
          >
            Close
          </button>
  
        </div>
  
      </div>
    );
  }
  
  export default OrderStatusModal;