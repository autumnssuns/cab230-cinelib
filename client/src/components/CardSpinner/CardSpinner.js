import './CardSpinner.css'

export default function CardSpinner({size}){
    return (
        <div className="spinner" style={
            {
                "--size": size
        }}>
            <span></span>
        </div>
    );
}