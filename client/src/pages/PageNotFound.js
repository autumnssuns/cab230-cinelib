import "./Common.css";
import { Separator } from "../components/Separator/Separator";
import { Link } from "react-router-dom";

export function PageNotFound() {
  return (
    <div className="centering-page">
      <div className="shadow-card shadow-fade-in">
        <div className="shadow-card-content content-fade-in">
          <h1>Oops!</h1>
          <Separator direction="horizontal" />
          <p>The page you are looking for does not exist.</p>
          <p>
            <Link to="/">Click here to go back to the home page.</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
