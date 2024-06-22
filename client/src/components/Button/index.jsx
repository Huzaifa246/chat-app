import React from 'react'

const ButtonComp = ({
    label = 'Button',
    type = 'button',
    className = '',
    disabled = false,
}) => {
    return (
        <>
            <button type={type} className={`${className} bg-primary text-white px-4 py-2 rounded-md shadow-md hover:bg-primary-600`}
                disabled={disabled}
            >
                {label}
            </button >
        </>
    )
}

export default ButtonComp