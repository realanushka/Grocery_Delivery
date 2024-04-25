import React, {useState} from 'react';
import {BsCloudUpload} from 'react-icons/bs';
import {ImagetoBase64} from '../utility/imagetoBase64';
import { toast } from 'react-hot-toast';
   
const NewProduct = () => {
  const [data, setData] = useState({
    unique: true,
    name:'',
    category:'',
    image:'',
    price:'',
    description:'',
  })

  const handleOnChange = (e) => {
    const {name, value} = e.target

    setData((preve) => {
      return {
        ...preve,
        [name]: value
      }
    })
  };

  const uploadImage = async(e)=>{
    console.log('File object:', e.target.files[0]);
    // console.log(data);
    
    const file = e.target.files[0];
    if (file){
      const data = await ImagetoBase64(file);
      setData((preve)=>{
      return{
        ...preve,
        image: data
      };
    });
    }
    
  };


//   const uploadImage = (e) => {
//   console.log('File object:', e.target.files[0]);

//   const reader = new FileReader();
//   reader.onload = (event) => {
//     const data = event.target.result;
//     setData((prev) => {
//       return {
//         ...prev,
//         image: data
//       };
//     });
//   };
  
//   const file = e.target.files[0];
//   if (file) {
//     reader.readAsDataURL(file);
//   }
// };


  console.log(process.env.REACT_APP_SERVER_DOMAIN);

  const handleSubmit = async(e) => {
    e.preventDefault() 
    console.log(data);

    const {name, image, category, price, description} = data;
    if (name && image && category && price && description) {
      const fetchData = await fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/uploadProduct`, {
        unique: true,
        method: 'POST',
        headers: { 
          'content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const fetchRes = await fetchData.json();
      console.log(fetchRes); 
      toast(fetchRes.message);

      setData(() => {
        return{
          name:'',
          category:'',
          image:'',
          price:'',
          description:'',
        }
      })
    }
    else {
      toast("Enter required fields!"); 
    }

  };

  return (
    <div className=' p-4 '>
      <form className='m-auto w-full max-w-md shadow flex flex-col p-3 bg-white' onSubmit={handleSubmit}>
        <label htmlFor='name'>Name</label>
        <input type={"text"} name="name" className='bg-slate-200 p-1 my-1' onChange={handleOnChange} value={data.name}/>

        <label htmlFor='category'>Category</label>
        <select className='bg-slate-200 p-1 my-1 ' id='category' name='category' onChange={handleOnChange} value={data.category}>
          <option value={"other"}>Select Category</option>
          <option value={"fruits"}>Fruits</option>
          <option value={"vegetables"}>Vegetables</option>
          <option value={"cakes"}>Cakes</option>
          <option value={"burger"}>Burger</option>
          <option value={"pizza"}>Pizza</option>
          <option value={"breakfast"}>Breakfast</option>
          <option value={"salad"}>Salad</option>
          <option value={"main-course"}>Main-Course</option>
          <option value={"non-veg"}>Non-Veg</option>
          <option value={"south-indian"}>South-Indian Dishes</option>
          <option value={"ice-cream"}>Ice-Cream</option>
        </select>  

        <label htmlFor='image'>Image
        <div className='h-40 w-full bg-slate-200 rounded flex items-center justify-center cursor-pointer'>
          {
            data.image ? <img src={data.image} className='h-full'/> : <span className='text-5xl'><BsCloudUpload/></span>
          }
          <input type={'file'} accept='image/*' id='image' onChange={uploadImage} className='hidden'></input>
        </div>
        </label>

        <label htmlFor='price' className='my-1'>Price</label>
        <input type={'text'} className='bg-slate-200 p-1 my-1' name='price' onChange={handleOnChange} value={data.price}/>

        <label htmlFor='description'>Description</label>
        <textarea rows = {2} className='bg-slate-200 p-1 my-1 resize-none' name='description' onChange={handleOnChange} value={data.description}></textarea>

        <button className='bg-blue-400 hover:bg-blue-500 text-white text-lg font-medium my-2 drop-shadow'>Save</button>
      </form>
    </div>
  );
}

export default NewProduct;
