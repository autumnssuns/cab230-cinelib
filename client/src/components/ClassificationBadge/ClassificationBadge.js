import "./ClassificationBadge.css"

export default function ClassificationBadge({text}){
    return (
        <div className="classification-badge">
            <div className="classification-badge-text">
                {text}
            </div>
        </div>
    )
}