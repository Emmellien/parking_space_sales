import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import API from "../api/api";

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

        // clear messages while typing
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");
        setSuccess("");

        try {

            const response =
                await API.post(
                    "/auth/register",
                    form
                );

            setSuccess(response.data.msg);

            setLoading(false);

            // redirect after 2 seconds
            setTimeout(() => {

                navigate("/login");

            }, 2000);

        } catch (error) {

            setLoading(false);

            setError(
                error.response?.data?.msg ||
                "Something went wrong"
            );
        }
    };

    return (

        <div className="min-h-screen flex justify-center items-center bg-slate-100 px-4">

            <div className="w-full max-w-md">

                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-8 rounded-2xl shadow-xl"
                >

                    {/* HEADER */}
                    <div className="text-center mb-8">

                        <h1 className="text-3xl font-bold text-slate-800">
                            Create Account
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Register to continue
                        </p>

                    </div>

                    {/* SUCCESS MESSAGE */}
                    {success && (

                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-5 text-sm">

                            {success}

                        </div>
                    )}

                    {/* ERROR MESSAGE */}
                    {error && (

                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">

                            {error}

                        </div>
                    )}

                    {/* NAME */}
                    <div className="mb-5">

                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter full name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />

                    </div>

                    {/* EMAIL */}
                    <div className="mb-5">

                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />

                    </div>

                    {/* PASSWORD */}
                    <div className="mb-2">

                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />

                    </div>

                    {/* PASSWORD HELP */}
                    <p className="text-xs text-gray-500 mb-6">

                        Password must contain:
                        uppercase, lowercase,
                        number and minimum 8 characters.

                    </p>

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-lg font-semibold flex justify-center items-center"
                    >

                        {loading ? (

                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>

                        ) : (

                            "Register"

                        )}

                    </button>

                    {/* LOGIN LINK */}
                    <p className="mt-6 text-center text-gray-600">

                        Already have account?

                        <Link
                            to="/login"
                            className="text-blue-600 font-semibold ml-2 hover:underline"
                        >
                            Login
                        </Link>

                    </p>

                </form>

            </div>

        </div>
    );
}

export default Register;