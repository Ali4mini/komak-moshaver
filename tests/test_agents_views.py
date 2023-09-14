from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.firefox.options import Options
import time

def test_login():
    # Set up the Chrome WebDriver
    options = Options()
    options.add_argument('-headless')
    driver = webdriver.Firefox(options=options)
    
    try:
        # Navigate to the login page
        driver.get("http://localhost:5173/agents/login")

        # Find the username and password input fields
        username_input = driver.find_element(By.NAME, "username")
        password_input = driver.find_element(By.NAME, "password")

        # Enter the username and password
        username_input.send_keys("testuser")
        password_input.send_keys("testuserpassword")

        # Submit the login form
        # password_input.send_keys(Keys.RETURN)
        driver.find_element(By.ID, 'submit').click()

        # Wait for the redirect to complete (assuming redirect takes some time)
        time.sleep(5)

        # Assert that the user is redirected to the home page
        assert driver.current_url == "http://localhost:5173/"

        # Get the value of user_id from local storage
        user_id = driver.execute_script("return window.localStorage.getItem('user_id');")

        # Assert that user_id is a valid integer
        assert user_id == '2'

    finally:
        # Close the browser window
        driver.close()
        driver.quit()

# Run the test
test_login()
