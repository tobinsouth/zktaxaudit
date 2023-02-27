import styled from "styled-components";

const Container = styled.div`
    position: relative;
    width: 100%;
    z-index: 40;
    textarea,
    pre {
        width: 100%;
        border: 1px;
        padding: 10px 15px 10px 15px;
        min-height: 3.5em;
        // line-height: 1.5em;
        margin: 0;
        border-top-left-radius: 7px;
        border-top-right-radius: 7px;
        -webkit-appearance: none;
        background: transparent;
        word-wrap: break-word;
        white-space: pre-wrap;
    }

    textarea {
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        overflow: scroll;
        resize: vertical;
        position: absolute;
        background: WhiteSmoke;
        color: black;
        opacity: 0.8;
        border-radius: 8px;
        color: black;
    }

    .hidden {
        visibility: hidden;
        display: block;
    }
`;

interface Props {
    value: string;
    onChangeHandler: (newVal: string) => void;
    placeholder: string;
}

export const Textarea = ({ value, onChangeHandler, placeholder }: Props) => {
    return (
        <div className="container w-full relative">
            <pre className="hidden">{value}</pre>
            <textarea rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={placeholder}
                value={value}
                onChange={(evt) => onChangeHandler(evt.target.value)}
            ></textarea>
        </div>
    );
};
