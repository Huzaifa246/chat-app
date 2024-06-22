import React, { useState } from 'react'
import InputComp from '../../components/Input'
import ButtonComp from '../../components/Button'

const Form = ({
    isSignInPage = true,
}) => {
    const [data, setData] = useState({
        ...(isSignInPage && { name: '' }),
        email: '',
        password: '',
    })

    console.log(data, 'data')
    return (
        <>
            <div className='bg-white w-[400px] h-[90%] shadow-lg rounded-lg flex flex-col justify-center items-center'>
                <div className='text-4xl font-bold'>
                    Welcome {isSignInPage ? '' : 'Back'}
                </div>
                <div className='text-lg font-light mb-6'>
                    {isSignInPage ? 'Sign Up to Get started' : 'Sign In to Continue'}
                </div>
                <form onSubmit={() => console.log("submitted")}
                    className='flex flex-col w-full items-center justify-center'
                >
                    {isSignInPage &&
                        <InputComp label='Full Name' name='name' placeholder='Enter Full Name' className='mb-2' value={data?.name} onChange={(e) => {
                            setData({
                                ...data,
                                name: e.target.value
                            })
                        }} />}
                    <InputComp label='Email' name='email' placeholder='Enter Your email' type='email' className='mb-2' value={data?.email} onChange={(e) => {
                        setData({
                            ...data,
                            email: e.target.value
                        })
                    }} />
                    <InputComp label='Password' name='password' placeholder='Enter Your Password' type='password' className='mb-2' value={data?.password} onChange={(e) => {
                        setData({
                            ...data,
                            password: e.target.value
                        })
                    }} />

                    <ButtonComp label={isSignInPage ? 'Sign Up' : "Sign In"} type='submit' className='w-1/2 mb-2' />

                </form>
                <div className='text-sm'>{isSignInPage ? "Already have an account? " : "Didn't have acccount "}
                    <span className='text-primary cursor-pointer underline'>
                        {isSignInPage ? "Sign In" : "Sign Up"}
                    </span></div>
            </div>
        </>
    )
}

export default Form