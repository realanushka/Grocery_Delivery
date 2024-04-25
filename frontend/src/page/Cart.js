import React from 'react';
import { useSelector } from 'react-redux';
import ProductCart from '../component/ProductCart';
import { current } from '@reduxjs/toolkit';
import emptyCartImage from '../assest/empty.gif';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const productCartItem = useSelector((state)=> state.product.cartItem)
  // console.log(productCartItem);
  const user = useSelector((state)=> state.user);
  // console.log(user);
  const navigate = useNavigate();

  const totalPrice = productCartItem.reduce((acc, curr) => acc + parseInt(curr.total), 0);
  const totalQty = productCartItem.reduce((acc, curr) => acc + parseInt(curr.qty), 0);

  const handlePayment = async() => {
    if (user.email){
      const stripePromise = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
      const res= await fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/checkout-payment`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
      body: JSON.stringify(productCartItem)
      })
      if (res.statusCode ===500) return;

      const data = await res.json();
      // console.log(data);

      toast("Redirect to Payment Gateway!")
      stripePromise.redirectToCheckout({sessionId:data})
    }

    else{
      toast("You have not Login!");
      setTimeout(()=>{
        navigate("/login")
      }, 2000)
    }
    
  } 

  return (
    <>
    
      <div className='p-2 md:p-4'>
        <h2 className='text-lg md:text-2xl font-bold text-slate-600'>Your Cart Items</h2>

        { productCartItem[0] ?
          <div className='my-4 flex gap-3'>
              {/* Display Cart Items */}
            <div className='w-full max-w-3xl'>
              {
                productCartItem.map((el) => {
                  return(
                    <ProductCart
                      key={el._id}
                      id={el._id}
                      name={el.name}
                      image={el.image}
                      category={el.category}
                      qty={el.qty}
                      total={el.total}
                      price={el.price}
                    />
                  )
                })
              }
            </div>

              {/* Total Cart Items */}
            <div className='w-full max-w-xl  ml-auto'>
              <h2 className='bg-blue-400 text-white p-2 text-lg'>Summary</h2>

              <div className='flex w-full py-2 text-lg border-b'>
                <p>Total Quantity:</p>
                <p className='ml-auto w-32 font-bold'>{totalQty}</p>
              </div>

              <div className='flex w-full py-2 text-lg border-b'>
                <p>Total Price:</p>
                <p className='ml-auto w-32 font-bold'><span className='text-red-500'>₹</span>{totalPrice}</p>
              </div>

              <button className='bg-red-500 w-full rounded-full text-lg font-bold py-2 text-white cursor-pointer' onClick={handlePayment}>
                Payment
              </button>

            </div>
          </div>

          :

          <>
            <div className='flex flex-col w-full justify-center items-center'>
              <img src={emptyCartImage} className='w-full max-w-md'/>
              <p className='text-slate-500 text-3xl font-bold'>Empty Cart</p>
              <p className='text-slate-700 text-4xl font-bold'><i>Shop Now!</i></p>
            </div>
          </>
        }
      </div>
    </>
  );
}

export default Cart;
