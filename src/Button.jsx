export const Button = ({name, clickEvent, display=true}) => {
    if(!display) return null;
    return (
        <button
            style={{ width: 'fit-content', fontSize: '28px', color: 'white', backgroundColor: '#252525' }}
            onClick={clickEvent}
        >
            {name}
        </button>
    )
}