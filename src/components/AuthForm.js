import React from "react";

const AuthForm = ({ formData, handleChange, handleSubmit, fields, buttonText, loading, message }) => {
  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>{buttonText}</h2>
        <div className="auth-decoration"></div>
      </div>
      <form onSubmit={handleSubmit} className="auth-form">
        {fields.map((field, index) => (
          <div className="form-group" key={index}>
            {field.type === "select" ? (
              <>
                <label htmlFor={field.name}>{field.placeholder || field.name}</label>
                <select 
                  id={field.name}
                  name={field.name} 
                  value={formData[field.name]} 
                  onChange={handleChange} 
                  required={field.required}
                  className="form-input"
                >
                  {field.options.map((option, idx) => (
                    <option key={idx} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <label htmlFor={field.name}>{field.placeholder || field.name}</label>
                <input
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  className="form-input"
                />
              </>
            )}
          </div>
        ))}
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? (
            <span className="button-loader"></span>
          ) : (
            <span>{buttonText}</span>
          )}
        </button>
      </form>
      {message && !loading && (
        <p className={`auth-message ${message.includes("success") ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AuthForm;