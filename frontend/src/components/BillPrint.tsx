type Item = {
    name: string
    quantity: number
    price: number
    total: number
  }
  
  type Props = {
    order_id: number
    table: number
    items: Item[]
    total_amount: number
  }
  
  export default function BillPrint({order_id, table, items, total_amount}:Props){
  
  return(
  
  <div id="bill">
  
  <h2>My Restaurant</h2>
  
  <p>Table: {table}</p>
  <p>Order: {order_id}</p>
  
  <hr/>
  
  {items.map((item,i)=>(
  <div key={i}>
  {item.name} x{item.quantity} - ₹{item.total}
  </div>
  ))}
  
  <hr/>
  
  <h3>Total: ₹{total_amount}</h3>
  
  <p>Thank You!</p>
  
  </div>
  
  )
  
  }