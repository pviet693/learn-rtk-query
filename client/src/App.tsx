import "./App.css";
import Blog from "pages/blog";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
	return (
		<>
			<ToastContainer />
			<Blog />
		</>
	);
}

export default App;
