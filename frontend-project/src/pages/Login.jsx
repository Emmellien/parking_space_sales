import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import API from "../api/api";

function Login() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

        // clear error while typing
        setError("");
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");

        try {

            const response =
                await API.post(
                    "/auth/login",
                    form
                );

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            setLoading(false);

            navigate("/dashboard");

        } catch (error) {

            setLoading(false);

            setError(
                error.response?.data?.msg ||
                "Something went wrong"
            );
        }
    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">

            <div className="w-full max-w-md">

                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-xl rounded-2xl p-8"
                >

                    <div className="text-center mb-8">

                        <h1 className="text-3xl font-bold text-slate-800">
                            Welcome Back
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Login to SmartPark Admin Portal
                        </p>

                    </div>

                    {/* ERROR MESSAGE */}
                    {error && (

                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">

                            {error}

                        </div>
                    )}

                    {/* EMAIL */}
                    <div className="mb-5">

                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />

                    </div>

                    {/* PASSWORD */}
                    <div className="mb-6">

                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />

                    </div>

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-lg font-semibold flex justify-center items-center"
                    >

                        {loading ? (

                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>

                        ) : (

                            "Login"

                        )}

                    </button>

                    {/* back to home with arrow show back */}
                    <p className="text-center text-gray-600 mt-6">

                   

                        <Link
                            to="/"
                            className="text-blue-600 font-semibold ml-2 hover:underline"
                        >
                            Back to Home
                        </Link>

                    </p>

                </form>

            </div>

        </div>
    );
}

export default Login;