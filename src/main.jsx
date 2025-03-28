import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import store from './Redux/store.jsx';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import NotificationHandler from './Components/ui/NotificationHandler.jsx';

// Add Redux store debugging
// console.log("Redux store initial state:", store.getState());

// Subscribe to state changes
store.subscribe(() => {
  // console.log("Redux state updated:", store.getState().auth);
});

// Clean up the render syntax (remove the stray comma)
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <StrictMode>
        <NotificationHandler />
        <App />
      </StrictMode>
    </BrowserRouter>
  </Provider>
);