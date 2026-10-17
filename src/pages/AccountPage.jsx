/*
  AccountPage component

  This page shows basic information about the
  currently logged-in user.
*/

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./AccountPage.css"
import ContactBar from "../components/ContactBar"

function AccountPage({
  currentUser,
  setIsLoggedIn,
  setCurrentUser
}) {
    const navigate = useNavigate()
    const [formData, setFormData] = useState(() => ({
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        phone: currentUser?.phone || "",
        street: currentUser?.street || "",
        city: currentUser?.city || "",
        postal_code: currentUser?.postal_code || "",
        country: currentUser?.country || ""
    }))

    const [isEditing, setIsEditing] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)


    const handleSave = () => {
        fetch("http://localhost:3000/api/account", {
            method: "PUT",
            credentials: "include",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
            console.log(data.message)

            if (data.message === "Account updated successfully.") {
                setIsEditing(false)
            }
        })
    }

    const handleDelete = () => {
        fetch("http://localhost:3000/api/account", {
            method: "DELETE",
            credentials: "include"
        })
            .then(response => response.json())
            .then(data => {
            console.log("DELETE RESPONSE:", data)

            if (data.message === "Account deleted successfully.") {
                setIsLoggedIn(false)
                setCurrentUser(null)
                navigate("/")
            }
            })
        }

  return (
    <>
        <main className="account-page">

        <div className="account-container">

            <p className="eyebrow">YOUR ACCOUNT</p>

            <h1>WELCOME BACK.</h1>

            <p className="account-text">
            Here you can view your account information.
            </p>

            <div className="account-info">

                <div className="account-info-row">
                    <span>Name</span>
                    <strong>{currentUser?.name}</strong>
                </div>

                <div className="account-info-row">
                    <span>Email</span>
                    <strong>{currentUser?.email}</strong>
                </div>

                <div className="account-info-row">
                    <span>Phone</span>

                    {isEditing ? (
                        <input
                        type="text"
                        placeholder="✎ Add phone"
                        value={formData.phone}
                        onChange={(event) =>
                            setFormData({
                            ...formData,
                            phone: event.target.value
                            })
                        }
                        />
                    ) : (
                        <strong className={!formData.phone ? "empty-account-value" : ""}>
                        {formData.phone || "✎ Add phone"}
                        </strong>
                    )}
                </div>

                <div className="account-info-row">
                    <span>Street</span>

                    {isEditing ? (
                        <input
                        type="text"
                        placeholder="✎ Add street"
                        value={formData.street}
                        onChange={(event) =>
                            setFormData({
                            ...formData,
                            street: event.target.value
                            })
                        }
                        />
                    ) : (
                        <strong className={!formData.street ? "empty-account-value" : ""}>
                        {formData.street || "✎ Add street"}
                        </strong>
                    )}
                </div>

                <div className="account-info-row">
                    <span>City</span>

                    {isEditing ? (
                        <input
                        type="text"
                        placeholder="✎ Add city"
                        value={formData.city}
                        onChange={(event) =>
                            setFormData({
                            ...formData,
                            city: event.target.value
                            })
                        }
                        />
                    ) : (
                        <strong className={!formData.city ? "empty-account-value" : ""}>
                        {formData.city || "✎ Add city"}
                        </strong>
                    )}
                </div>

                <div className="account-info-row">
                    <span>Postal Code</span>

                    {isEditing ? (
                        <input
                        type="text"
                        placeholder="✎ Add postal code"
                        value={formData.postal_code}
                        onChange={(event) =>
                            setFormData({
                            ...formData,
                            postal_code: event.target.value
                            })
                        }
                        />
                    ) : (
                        <strong className={!formData.postal_code ? "empty-account-value" : ""}>
                        {formData.postal_code || "✎ Add postal code"}
                        </strong>
                    )}
                </div>

                <div className="account-info-row">
                    <span>Country</span>

                    {isEditing ? (
                        <input
                        type="text"
                        placeholder="✎ Add country"
                        value={formData.country}
                        onChange={(event) =>
                            setFormData({
                            ...formData,
                            country: event.target.value
                            })
                        }
                        />
                    ) : (
                        <strong className={!formData.country ? "empty-account-value" : ""}>
                        {formData.country || "✎ Add country"}
                        </strong>
                    )}
                </div>

            </div>

            {isEditing ? (
                <button
                    className="save-account-button"
                    onClick={handleSave}
                >
                    SAVE CHANGES
                </button>
                ) : (
                <button
                    className="save-account-button"
                    onClick={() => setIsEditing(true)}
                >
                    EDIT ACCOUNT
                </button>
            )}

            <div className="danger-zone">

                <h2>DANGER ZONE</h2>

                <p>
                    Deleting your account is permanent and cannot be undone.
                </p>

                <button
                    className="delete-account-button"
                    onClick={() => setIsDeleteModalOpen(true)}
                >
                    DELETE ACCOUNT
                </button>

            </div>

        </div>

        {isDeleteModalOpen && (
            <div className="delete-modal-overlay">

                <div className="delete-modal">

                <p className="eyebrow">DANGER ZONE</p>

                <h2>DELETE ACCOUNT?</h2>

                <p>
                    Are you sure you want to delete your account?
                    This action cannot be undone.
                </p>

                <div className="delete-modal-actions">

                    <button
                    className="cancel-delete-button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    >
                    CANCEL
                    </button>

                    <button
                    className="confirm-delete-button"
                    onClick={() => {
                        setIsDeleteModalOpen(false)
                        handleDelete()
                    }}
                    >
                    DELETE ACCOUNT
                    </button>

                </div>

                </div>

            </div>
            )}

        </main>

        < ContactBar />
    </>


  )
}

export default AccountPage
