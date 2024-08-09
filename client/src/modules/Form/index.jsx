import React, { useState } from 'react'
import InputComp from '../../components/Input'
import ButtonComp from '../../components/Button'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack';

const Form = ({
    isSignInPage = true,
}) => {
    const [data, setData] = useState({
        ...(isSignInPage && { fullName: '' }),
        email: '',
        password: '',
    })

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/${!isSignInPage ? 'login' : 'register'}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        },
        )

        try {
            if(!data.email || !data.password){
                 return enqueueSnackbar('Please enter email address or password', { variant: 'error' });
            }
            const resData = await response.json();

            if (response.ok) {
                if (resData?.token) {
                    localStorage.setItem('user:token', resData?.token);
                    localStorage.setItem('user:detail', JSON.stringify(resData?.user));
                    navigate('/');
                    enqueueSnackbar("Success", { variant: 'success' });
                }
            } else {
                // alert("error")
                enqueueSnackbar(resData.message || 'Error', { variant: 'error' });
            }
        } catch (error) {
            // alert("error")
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    };
    return (
        <>
            <div className="bg-[#edf4ff] h-screen flex justify-center items-center">
                <div className='bg-white w-[400px] h-[90%] shadow-lg rounded-lg flex flex-col justify-center items-center'>
                    <div className='text-4xl font-bold'>
                        Welcome {isSignInPage ? '' : 'Back'}
                    </div>
                    <div className='text-lg font-light mb-6'>
                        {isSignInPage ? 'Sign Up to Get started' : 'Sign In to Continue'}
                    </div>
                    <form onSubmit={(e) => handleSubmit(e)}
                        className='flex flex-col w-full items-center justify-center'
                    >
                        {isSignInPage &&
                            <InputComp label='Full Name' name='fullName' placeholder='Enter Full Name' className='mb-2' value={data?.fullName} onChange={(e) => {
                                setData({
                                    ...data,
                                    fullName: e.target.value
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
                        <span className='text-primary cursor-pointer underline'
                            onClick={() => navigate(`/users/${isSignInPage ? 'sign_in' : 'sign_up'}`)}
                        >
                            {isSignInPage ? "Sign In" : "Sign Up"}
                        </span></div>
                </div>
            </div>
        </>
    )
}

export default Form