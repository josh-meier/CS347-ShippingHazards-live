
interface TextFieldWithErrorProps {
    password?: boolean;
    placeholder?: string;
    value: string;
    setValue: (value: string) => void;
    errorVisible: boolean;
    errorMessage?: string;
    style?: React.CSSProperties;
}

export default function TextFieldWithError({ password = false, placeholder = "", value, setValue, errorVisible, errorMessage = placeholder.length > 0 ? placeholder + " is required" : "This field is required", style }: TextFieldWithErrorProps) {
    return (
        <div className="inputContainer" style={style}>
            <input
                type={password ? "password" : "text"}
                value={value}
                placeholder={placeholder}
                onChange={(ev) => setValue(ev.target.value)}
                className="inputBox"
            />
            <label className="errorLabel" style={{ display: errorVisible ? "block" : "none" }}>{errorMessage}</label>
        </div>
    );
}
