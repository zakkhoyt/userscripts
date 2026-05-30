

# ViolentMonkey

Violentmonkey is a brower plugin that manaages and runs Userscripts. It also allows for live editing and debugging. 


## `scripts/violentmonkey/violentmonkey.zsh`

A zsh script to help with live userscript development:
* Edit code using `Visual Studio Code.app` instead of a browser
* Assists with spinning up http servers, etc...

> [!NOTE]
> from `violentmonkey.zsh --help`
>
> Serves a ViolentMonkey/GreaseMonkey userscript via HTTP server for live development with automatic reload. The script starts an http-server instance, opens the script URL in a browser, and monitors for file changes. This enables rapid development workflow: edit the userscript in your editor, save, and if "${open_cmd[@]}"; then
>
> The script automatically detects all available network interfaces and allows you to select which URL to use, or automatically selects based on a preferred IP.

**Example Usage**
```zsh
# violentmonkey.zsh --help
# violentmonkey.zsh --script <path_to_user.js>
# violentmonkey.zsh --script <path_to_user.js> [--preferred-ip <a.b.c.d>] [--debug]

./violentmonkey.zsh \
  --script markdown_linker/markdown_linker.user.js \
  --preferred-ip "127.0.0.1" \
  --debug
```


# Debugging

* To use breakpoints, insert the line `debugger;` which is like a programmatic breakpoint.
* Open your browser debugger then reload the page. You should hit the breakpoint. 
* Inspect elements and properties using breakpoint


![firefox_debugger_breakpoint](images/firefox_debugger_breakpoint.png)


