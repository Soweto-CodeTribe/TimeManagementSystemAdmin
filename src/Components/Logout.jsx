import { useDispatch } from "react-redux";
import { logout } from "../Slices/authSlice";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(logout());
    navigate("/login");
  }, [dispatch, navigate]);

  return <p>Logging out...</p>;
};

export default Logout;
