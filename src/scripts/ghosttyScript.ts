export function getGhosttyScript(openIn: string, command: string): string {
    return `
    -- Set this property to true to open in a new window instead of a new tab
    property open_in_new_window : ${openIn === "newWindow"}
    
    on new_window()
        tell application "Ghostty"
            activate
        end tell
        
        tell application "System Events"
            keystroke "n" using {command down}
        end tell
    end new_window

    on new_tab()
        tell application "System Events"
            -- Check if Ghostty is already running
            set isRunning to (exists process "Ghostty")
            
            if isRunning then
                -- If Ghostty is running, bring it to the front and open a new tab
                tell application "Ghostty" to activate
                tell application "System Events" to keystroke "t" using command down
            else
                -- If Ghostty isn't running, launch it
                launch application "Ghostty"
            end if
        end tell
    end new_tab

    on call_forward()
        tell application "Ghostty" to activate
    end call_forward

    on is_running()
        application "Ghostty" is running
    end is_running

    -- Ghostty doesn't have a direct equivalent to 'is processing', so we'll assume it's ready if it's running
    on is_processing()
        is_running()
    end is_processing

    on has_windows()
        if not is_running() then return false
        -- Ghostty always has at least one window, so we'll just check if it's running
        true
    end has_windows

    on send_text(custom_text)
        tell application "System Events"
            -- Ensure Ghostty is active before sending text
            tell application "Ghostty" to activate
            delay 0.2 -- Small delay to ensure Ghostty is ready
            
            -- Check if Ghostty is frontmost
            set frontApp to name of first application process whose frontmost is true
            if frontApp is "Ghostty" then
                repeat with i from 1 to count of characters of custom_text
                    set theChar to character i of custom_text
                    if theChar is " " then
                        key code 49
                    else
                        keystroke theChar
                    end if
                end repeat
                keystroke return
            else
                display dialog "Ghostty is not the frontmost application."
            end if
        end tell
    end send_text

    if has_windows() then
        if open_in_new_window then
            new_window()
        else
            new_tab()
        end if
    else
        if is_running() then
            new_window()
        else
            call_forward()
        end if
    end if

    repeat until has_windows()
        delay 1.0
    end repeat
    delay 1.0

    send_text("${command}")
    `;
}
