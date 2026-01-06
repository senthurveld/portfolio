
export const SkillCards = ({name, level, img}) => {
    return (
        <div>
            <h2>{name}</h2>
            <p>{level}</p>
            <img src={img} alt={name} />
        </div>
    )
}