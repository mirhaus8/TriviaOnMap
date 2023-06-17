import * as yup from 'yup';

export const loginForm = yup.object().shape({
    username: yup.string().required("username is required"),
    password: yup.string().required("Password  is required")
})
