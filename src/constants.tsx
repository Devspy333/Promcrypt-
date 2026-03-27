export const PROMCRYPT_DOCS = `# Command Line Options

The following table provides a brief overview over the command line options:

| Option                | Usage                                         |
|-----------------------|-----------------------------------------------|
| --preset [name]; --p [name] | Specify the config preset to be used; Details |
| --config [path]; --c [path] | Specify the path to a custom config file      |
| --out [path]; --o [path]    | Specify the path of the output file           |
| --nocolors            | Disable ansi colors escape sequences          |
| --Lua51               | Handle input as Lua 5.1                       |
| --LuaU                | Handle input as LuaU                          |
| --pretty              | Pretty print the output                       |
| --version; -v         | Display the version number and exit            |

# Presets

The following table provides an overview over the presets

| name    | size   | speed   |
|---------|--------|---------|
| Minify  | tiny   | fastest |
| Weak    | small  | fast    |
| Medium  | medium | medium  |
| Strong  | huge   | slowest |

# The Config Object

Prometheus takes a configuration objetct. In this object there can be many properties applied. The following table provides an overview:

| Property         | type   | possible values                               | default            |
|------------------|--------|-----------------------------------------------|--------------------|
| LuaVersion       | string | "Lua51", "LuaU"                               | "Lua51"            |
| PrettyPrint      | boolean| true, false                                   | false              |
| VarNamePrefix    | string | any                                           | ""                 |
| NameGenerator    | string | "Mangled", "MangledShuffled", "Il", "Number"  | "MangledShuffled"  |
| Seed             | number | any                                           | 0                  |
| Steps            | table  | StepConfig[]                                  | {}                 |

# WrapInFunction

### Settings

| Name       | type   | description              |
| ---------- | ------ | ------------------------ |
| Iterations | number | The Number Of Iterations |

### Example

\`\`\`lua
print("Hello, World!")
\`\`\`

\`\`\`lua
-- Iterations = 1
return (function()
    print("Hello, World!")
end)()
\`\`\`

# Vmify

Settings

None

# SplitStrings

Settings

| Name | type | description | Values |
| --- | --- | --- | --- |
| Treshold | number | The relative amount of nodes that will be affected | 0 <= x <= 1 |
| MinLength | number | The minimal length for the chunks in that the Strings are splitted | x > 0 |
| MaxLength | number | The maximal length for the chunks in that the Strings are splitted | x >= MinLength |
| ConcatenationType | enum | The Functions used for Concatenation. Note that when using custom, the String Array will also be Shuffled | "strcat", "table", "custom" |
| CustomFunctionType | enum | The Type of Function code injection This Option only applies when custom Concatenation is selected. Note that when chosing inline, the code size may increase significantly! | "global", "local", "inline" |
| CustomLocalFunctionsCount | number | The number of local functions per scope. This option only applies when CustomFunctionType = local | x > 0 |

# ProxifyLocals

Settings

| Name | type | description | values |
| --- | --- | --- | --- |
| LiteralType | enum | The type of the randomly generated literals | "dictionary", "number", "string", "any" |

# EncryptStrings

Settings

None

# ConstantArray

Settings

| Name | type | description |
| --- | --- | --- |
| Treshold | number | The relative amount of nodes that will be affected" |
| StringsOnly | boolean | Wether to only Extract Strings |
| Shuffle | boolean | Wether to shuffle the order of Elements in the Array |
| Rotate | boolean | Wether to rotate the String Array by a specific (random) amount. This will be undone on runtime. |
| LocalWrapperTreshold | number | The relative amount of nodes functions, that will get local wrappers |
| LocalWrapperCount | number | The number of Local wrapper Functions per scope. This only applies if LocalWrapperTreshold is greater than 0 |
| LocalWrapperArgCount | number | The number of Arguments to the Local wrapper Functions |
| MaxWrapperOffset | number | The Max Offset for the Wrapper Functions |

# Using Prometheus in your Lua Application

Prometheus can also be used as a library for your custom Lua Applications instead of using it's cli tool.

In order to do that you'll first need to clone the github repo:

\`\`\`batch
git clone "https://github.com/levno-710/Prometheus.git"
\`\`\`

After that, you'll need to copy everything within the src folder to your project. Let's say you created a folder named prometheus, where all the Prometheus files are located. You can the use the following code to obfuscate a string:

\`\`\`lua
local Prometheus = require("prometheus.prometheus")

-- If you don't want console output
Prometheus.Logger.logLevel = Prometheus.Logger.LogLevel.Error

-- Your code
local code = 'print("Hello, World!")'

-- Create a Pipeline using the Strong preset
local pipeline = Prometheus.Pipeline:fromConfig(Prometheus.Presets.Strong)

-- Apply the obfuscation and print the result
print(pipeline:apply(code));
\`\`\`

Instead of passing the Strong preset you could also pass a custom Config Object.
`;
