export function handleCommand(line) {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
        return "ERROR empty command";
    }

    const [command, ...parts] = trimmed.split(" ");
    const argument = parts.join(" ");

    switch (command.toUpperCase()) {
        case "ECHO":
            return argument;

        // TODO: implement UPPER
        // Example:
        // UPPER hello -> HELLO
        case "UPPER":
            return argument.toUpperCase()

        // TODO: implement LOWER
        // Example:
        // LOWER HELLO -> hello
        case "LOWER":
            return argument.toLowerCase()

        // TODO: implement REVERSE
        // Example:
        // REVERSE hello -> olleh
        case "REVERSE":
            return argument.split('').reverse().join('');

        case "QUIT":
            return "Goodbye.";

        default:
            return `ERROR unknown command: ${command}`;
    }
}

export function shouldCloseConnection(line) {
    return line.trim().toUpperCase() === "QUIT";
}