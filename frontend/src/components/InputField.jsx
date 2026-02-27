import './InputField.css';

const InputField = ({ label, id, error, ...props }) => (
  <div className="input-group">
    {label && <label htmlFor={id}>{label}</label>}
    <input id={id} className={`input-field ${error ? 'input-error' : ''}`} {...props} />
    {error && <span className="input-error-msg">{error}</span>}
  </div>
);

export default InputField;
