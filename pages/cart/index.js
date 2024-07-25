import { useContext, useEffect, useState } from "react";
import { CartContext } from "../../lib/CartContext";
import axios from "axios";
import Link from "next/link";
import Spinner from "@/components/Spinner";
import { useSession, signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Success from "@/components/Success";

export default function Cart() {
  const { cartProducts, removeProduct, addProduct, clearCart } =
    useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (cartProducts.length > 0) {
      axios.post("/api/cart", { ids: cartProducts }).then((response) => {
        setProducts(response.data);
        setLoading(false);
      });
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [cartProducts]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (window?.location.href.includes("success")) {
      setIsSuccess(true);
      clearCart();
      toast.success("Order successfully placed !!");
    }
  }, []);

  let total = 0;
  for (const productId of cartProducts) {
    const product = products.find((p) => p._id === productId);
    if (product) {
      total +=
        product.price * cartProducts.filter((id) => id === productId).length;
    }
  }

  const VAT = total / 1000;
  const subTotal = total + VAT;

  function increaseProduct(id) {
    addProduct(id);
  }

  function decreaseProduct(id) {
    removeProduct(id);
    toast.success("Removed product!!");
  }

  function deleteCart(id) {
    clearCart();
    toast.success("Cart cleared!!");
  }

  const formatPrice = (price) => {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  async function stripeCheckout() {
    const response = await axios.post("/api/checkout", {
      email: session.user.email,
      name: session.user.name,
      address,
      country,
      zip,
      city,
      cartProducts,
    });

    if (response.data.url) {
      window.location = response.data.url;
    } else {
      toast.error("An error occurred!!");
    }
  }

  if (isSuccess) {
    return (
      <>
        <Success />
      </>
    );
  }

  if (session) {
    return (
      <>
        <section className="flex flex-col md:flex-row justify-between space-x-4">
          <div className="md:w-3/5 px-4">
            {" "}
            {/* Adjusted width */}
            <div className="mt-16 md:mt-6">
              <header className="text-center flex justify-between w-full">
                <h1 className="text-xl font-bold text-gray-900 sm:text-3xl">
                  Your Cart
                </h1>
              </header>
              {loading ? (
                <div className="flex justify-center items-center h-screen">
                  <Spinner />
                </div>
              ) : !products?.length ? (
                <p className="my-6 text-center">Your cart is empty</p>
              ) : (
                <>
                  {products?.length > 0 &&
                    products.map((product) => (
                      <div key={product._id} className="mt-8">
                        <ul className="space-y-4">
                          <li className="flex items-center gap-4 justify-between">
                            <img
                              src={product.images[0]}
                              alt=""
                              className="h-16 w-16 rounded object-cover"
                            />
                            <div>
                              <h3 className="text-md text-text max-w-md">
                                {product.title}
                              </h3>
                              <dl className="mt-0.5 space-y-px text-[10px] text-text">
                                <p>
                                  $.
                                  {formatPrice(
                                    cartProducts.filter(
                                      (id) => id === product._id
                                    ).length * product.price
                                  )}
                                </p>
                              </dl>
                            </div>
                            <div>
                              <label htmlFor="Quantity" className="sr-only">
                                {" "}
                                Quantity{" "}
                              </label>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  className="w-10 h-10 leading-10 text-text transition hover:opacity-75 border "
                                  onClick={() => decreaseProduct(product._id)}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  id="Quantity"
                                  value={
                                    cartProducts.filter(
                                      (id) => id === product._id
                                    ).length
                                  }
                                  className="h-10 w-16 rounded border border-secondary text-primary font-bold text-center [-moz-appearance:_textfield] sm:text-md [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  className="w-10 h-10 leading-10 text-text transition hover:opacity-75 border"
                                  onClick={() => increaseProduct(product._id)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    ))}
                  <div className="mt-8 flex justify-end border-t border-gray-100 pt-8">
                    <div className="max-w-md space-y-4">
                      <dl className="space-y-0.5 text-md text-gray-700">
                        <div className="flex justify-end text-red-400 border-b mb-3">
                          <button onClick={deleteCart}>Clear Cart</button>
                        </div>
                        <div className="flex justify-between">
                          <dt>Subtotal</dt>
                          <dd>$. {formatPrice(total)}</dd>
                        </div>
                        <strike className="flex justify-between">
                          <dt>VAT</dt>
                          <dd>$. {formatPrice(VAT)}</dd>
                        </strike>
                        <div className="flex justify-between !text-base font-medium">
                          <dt>Total</dt>
                          <dd>$. {formatPrice(subTotal)}</dd>
                        </div>
                      </dl>
                      <div className="flex justify-end">
                        <Link
                          className="group flex items-center justify-between gap-4 rounded-lg border border-current px-4 py-2 text-orange-600 transition-colors hover:bg-orange-600 focus:outline-none focus:ring active:bg-orange-500"
                          href="/products"
                        >
                          <span className="font-medium transition-colors group-hover:text-white">
                            Continue shopping
                          </span>
                          <span className="shrink-0 rounded-full border border-orange-600 bg-white p-2 group-active:border-orange-500">
                            <svg
                              className="h-4 w-4 rtl:rotate-180"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          {!products.length ? (
            ""
          ) : (
            <div className="md:w-2/5 mt-16 md:mt-6">
              {" "}
              {/* Adjusted width */}
              <header className="text-start flex flex-col w-full">
                <h1 className="text-xl font-bold text-gray-900 sm:text-3xl">
                  Shipping details
                </h1>
                <p className="mt-2 text-text text-lg">
                  We use your account details for shipping.
                </p>
              </header>
              <div className="mx-auto max-w-xl p-4 border shadow-xl h-[400px] my-3">
                <div className="space-y-5">
                  <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-6">
                      <label className="mb-1 block text-sm font-medium text-text">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="block w-full rounded-md p-3 border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                        value={session.user.email}
                        placeholder="Email"
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="mb-1 block text-sm font-medium text-text">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="block w-full rounded-md p-3 border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                        value={session.user.name}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="col-span-12">
                      <label className="mb-1 block text-sm font-medium text-text">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        className="block w-full rounded-md p-3 border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="Ilesa"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="mb-1 block text-sm font-medium text-text">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        className="block w-full rounded-md p-3 border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder=""
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="mb-1 block text-sm font-medium text-text">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        className="block w-full rounded-md p-3 border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder=""
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-sm font-medium text-text">
                        Zip
                      </label>
                      <input
                        type="text"
                        name="zip"
                        className="block w-full rounded-md p-3 border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder=""
                      />
                    </div>
                    <div className="col-span-12 text-center w-full">
                      <button
                        className="disabled block rounded bg-secondary px-5 py-3 text-md text-text transition hover:bg-purple-300 w-full"
                        onClick={stripeCheckout}
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </>
    );
  }
  return (
    <>
      <div className="grid h-screen px-4 bg-white place-content-center">
        <div className="text-center">
          <p className="mt-4 text-text text-2xl">Sign up to view cart items.</p>
          <button
            onClick={() => signIn("google")}
            className="inline-block px-5 py-3 mt-6 text-md font-medium  text-gray-100 bg-primary border border-primary rounded hover:bg-white hover:text-primary focus:outline-none focus:ring"
          >
            Login / Register
          </button>
        </div>
      </div>
    </>
  );
}
