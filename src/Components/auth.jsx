import { useDispatch,useSelector } from 'react-redux';
import { increment,decrement } from '../Slices/authSlice';


const Auth = () => {
// useSelector is a hook that takes the current state as an argument and returns whatever data you need from it
const count = useSelector((state) => state.auth.value);



 // The dispatch function is used to dispatch actions to the store, this in turns updates the store
const dispatch = useDispatch();
const add = ()=>{
dispatch(increment());
}

const minus = ()=>{
    dispatch(decrement());
}

    return (
    <>
    <button onClick={()=>add() }>+</button>
    {count}
    <button onClick={()=>minus()}>-</button>
    </> 
     );
}
 
export default Auth;


