import React from 'react'

const InputComp = ({
    label = '',
    name = '',
    type = 'text',
    className = '',
    placeholder = '',
    isRequired = true,

    value = '',
    onChange = () => { },
}) => {
    return (
        <div className='w-1/2 mb-2'>
            <label for={name} className='block text-sm font-medium text-gray-900 dark:text-gray-300'>
                {label}
            </label>
            <input
                type={type}
                name={name}
                id={name}
                className={`${className} w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder={placeholder}
                required={isRequired}
                value={value}
                onChange={onChange}
            />
        </div>
    )
}

export default InputComp