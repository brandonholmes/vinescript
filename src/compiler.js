import parse from "./parser.js"

export default function compile(source, outputType) {
    outputType = outputType.toLowerCase()
    if (outputType === "ast") {
        return parse(source)
    }
}