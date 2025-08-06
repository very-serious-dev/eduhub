@echo off
setlocal enabledelayedexpansion

if not exist "code\backend\rest_api\database\db.sqlite3" (
  echo It seems that it's your first time running the EduPlaya. Welcome.
  echo I will create the SQLite backend databases and perform npm install in the frontend folder
  echo Then I will exit and you can try again - let's begin
  pause
  cd code\backend\rest_api\edu_rest_public
  python manage.py migrate
  cd ..\..
  copy create_admin.sql rest_api\database
  sqlite3.exe rest_api/database/db.sqlite3 ".read create_admin.sql"
  del rest_api\database\create_admin.sql
  cd ..\..
  cd code\backend\storage_api\docu_rest
  python manage.py migrate
  cd ..\..\..\..
  cd code\frontend
  npm install
  cd ..\..
  echo -------------------
  echo All done! Your environment is setup. Now I will exit.
  echo Execute start.bat again if you wish to run a development environment or build for production :-D
  pause
  exit
)

echo 1) Start development servers on local machine
echo 2) Build web applications for deployment
echo 3) Exit
echo ---
set /p OPTION="What do you want? "

if [%OPTION%] == [1] (
  start python code\backend\rest_api\edu_rest_public\manage.py runserver 0.0.0.0:8000
  start python code\backend\storage_api\docu_rest\manage.py runserver 0.0.0.0:8001
  start python code\backend\rest_api\edu_rest_internal\manage.py runserver 0.0.0.0:8002
  start npm start --prefix code\frontend
) else (
  if [%OPTION%] == [2] (
    if not exist code\frontend\src\client\Servers.js ( echo I couldn't find Servers.js... Aborting... && pause && exit -1 )
    if not exist code\backend\rest_api\edu_rest_public\edu_rest_public\settings.py ( echo I couldn't find edu_rest_public\settings.py... Aborting... && pause && exit -1 )
    if not exist code\backend\rest_api\edu_rest_public\edu_app\constants.py ( echo I couldn't find edu_app\constants.py... Aborting... && pause && exit -1 )
    if not exist code\backend\rest_api\edu_rest_internal\edu_rest_internal\settings.py ( echo I couldn't find edu_rest_internal\settings.py... Aborting... && pause && exit -1 )
    if not exist code\backend\storage_api\docu_rest\docu_rest\settings.py ( echo I couldn't find docu_rest\settings.py... Aborting... && pause && exit -1 )
    if not exist code\backend\storage_api\docu_rest\docu_rest_app\constants.py ( echo I couldn't find docu_rest_app\constants.py... Aborting... && pause && exit -1 )

    echo [OK] Source files that need to be modified during build exist. Moving on...

    if not exist build.config (
      set MUST_COPY_DBS=1
      echo [INFO] It looks that this is your first time making a build for deployment.
      echo For further information about the intented 3-servers architecture, see doc\deployment.md
      echo ---
      echo Now I'm going to ask you some questions and I will generate a build.config file
      set /p EDU_NAME="What is your React frontend server name (e.g.: www.myapp-eduplatform.org)? "
      echo EDU_NAME=!EDU_NAME!> build.config
      set /p API_NAME="What your Django public REST API server name? (e.g.: www.myappbackend-eduplatform.org) "
      echo API_NAME=!API_NAME!>> build.config
      set /p API_INTERNAL_NAME="That same machine must have configured an internal REST API (private interface). What's its name or IP? (add any port if needed, e.g. 192.168.0.5:1234) "
      echo API_INTERNAL_NAME=!API_INTERNAL_NAME!>> build.config
      set /p DOCU_NAME="What is your Django storage server name (e.g.: www.myappdocuments-eduplatform.org)? "
      echo DOCU_NAME=!DOCU_NAME!>> build.config
      echo Your storage server needs to communicate with your REST API server.
      echo If you have installed a self-signed certificate into the REST API server internal interface, then you must have safely copied the public key into the storage server.
      set /p API_INTERNAL_CERT_PATH_IN_DOCU="Where's the path to the self-signed certificate containing the public key? (e.g. /etc/ssl/certs/internal.crt, you can also specify None) "
      echo API_INTERNAL_CERT_PATH_IN_DOCU=!API_INTERNAL_CERT_PATH_IN_DOCU!>> build.config
      echo Ok, we're almost there.
      echo Now, randomly smash your keyboard to generate a string as long as you can. 
      echo It will be a secret pre-shared key between the storage server and the internal facade of the REST API. This is an additional security layer on top of having properly configured your servers in a limited access DMZ.
      set /p INTERNAL_SECRET="Please, type a random secret key: "
      echo INTERNAL_SECRET=!INTERNAL_SECRET!>> build.config
      echo Great! We're done.
      echo Before I proceed, please, note that you can add a logo_main.png file inside code\frontend\public\ folder and it will be displayed in the Login page and the Main screen. The recommended size is 300x65 
      pause
    ) else (
      set MUST_COPY_DBS=0
      echo [INFO] Using previously generated build.config...
      for /f "tokens=1,2* delims==" %%a in (build.config) do (
        if [%%a] == [EDU_NAME] (set EDU_NAME=%%b)
        if [%%a] == [API_NAME] (set API_NAME=%%b)
        if [%%a] == [API_INTERNAL_NAME] (set API_INTERNAL_NAME=%%b)
        if [%%a] == [DOCU_NAME] (set DOCU_NAME=%%b)
        if [%%a] == [API_INTERNAL_CERT_PATH_IN_DOCU] (set API_INTERNAL_CERT_PATH_IN_DOCU=%%b)
        if [%%a] == [INTERNAL_SECRET] (set INTERNAL_SECRET=%%b)
      )
    )
    for /f "tokens=1 delims=:" %%a in ("!API_INTERNAL_NAME!") do (set API_INTERNAL_NAME_WITHOUT_PORT=%%a)

    echo Modifying REST API source files...
    
    robocopy code\backend\rest_api rest_api /MIR > nul

    (for /f "tokens=*" %%a in ('type rest_api\edu_rest_public\edu_rest_public\settings.py ^| findstr /n "^"') do (
      set "line=%%a"
      set "line=!line:*:=!"
      if defined line (
        if "!line!" == "ALLOWED_HOSTS = []" ( echo ALLOWED_HOSTS = ["!API_NAME!"] ) else ( if "!line!" == "DEBUG = True" ( echo DEBUG = False ) else ( echo !line! ))
      ) else echo. 
    )) > edu_settings.py.temp
    move /y edu_settings.py.temp rest_api\edu_rest_public\edu_rest_public\settings.py > nul

    (for /f "tokens=*" %%a in ('type rest_api\edu_rest_public\edu_app\constants.py ^| findstr /n "^"') do (
      set "line=%%a"
      set "line=!line:*:=!"
      if defined line (
        if "!line!" == "ORIGIN_SERVER='http://localhost:3000'" ( echo ORIGIN_SERVER='https://!EDU_NAME!' ) else ( echo !line! )
      ) else echo:
    )) > edu_constants.py.temp
    move /y edu_constants.py.temp rest_api\edu_rest_public\edu_app\constants.py > nul

    (for /f "tokens=*" %%a in ('type rest_api\edu_rest_internal\edu_rest_internal\settings.py ^| findstr /n "^"') do (
      set "line=%%a"
      set "line=!line:*:=!"
      if defined line (
        if "!line!" == "ALLOWED_HOSTS = []" ( echo ALLOWED_HOSTS = ["!API_INTERNAL_NAME_WITHOUT_PORT!"] ) else ( if "!line!" == "DEBUG = True" ( echo DEBUG = False ) else ( echo !line! ))
      ) else echo. 
    )) > edu_int_settings.py.temp
    move /y edu_int_settings.py.temp rest_api\edu_rest_internal\edu_rest_internal\settings.py > nul

    echo INTERNAL_SECRET="!INTERNAL_SECRET!" > rest_api\edu_rest_internal\edu_app_internal\internal_secret.py

    echo [OK] REST API source files modified

    if [!MUST_COPY_DBS!] == [0] (
      del /s /q rest_api\database > nul
      rmdir /s /q rest_api\database
    )

    tar -cf backend_rest.tar rest_api
    del /s /q rest_api > nul
    rmdir /s /q rest_api

    echo [OK] backend_rest.tar generated
    echo Modifying storage server "Docu REST" source files...

    robocopy code\backend\storage_api storage_api /MIR > nul

    (for /f "tokens=*" %%a in ('type storage_api\docu_rest\docu_rest\settings.py ^| findstr /n "^"') do (
      set "line=%%a"
      set "line=!line:*:=!"
      if defined line (
        if "!line!" == "ALLOWED_HOSTS = []" ( echo ALLOWED_HOSTS = ["!DOCU_NAME!"] ) else ( if "!line!" == "DEBUG = True" ( echo DEBUG = False ) else ( echo !line! ))
      ) else echo. 
    )) > docu_settings.py.temp
    move /y docu_settings.py.temp storage_api\docu_rest\docu_rest\settings.py > nul

    (for /f "tokens=*" %%a in ('type storage_api\docu_rest\docu_rest_app\constants.py ^| findstr /n "^"') do (
      set "line=%%a"
      set "line=!line:*:=!"
      if defined line (
        if "!line!" == "ORIGIN_SERVER='http://localhost:3000'" ( echo ORIGIN_SERVER='https://!EDU_NAME!' ) else ( if "!line!" == "EDU_REST_INTERNAL_CERTIFICATE=None" ( echo EDU_REST_INTERNAL_CERTIFICATE='!API_INTERNAL_CERT_PATH_IN_DOCU!' ) else ( if "!line!" == "EDU_REST_INTERNAL_BASE_URL='http://localhost:8002'" ( echo EDU_REST_INTERNAL_BASE_URL='!API_INTERNAL_NAME!' ) else ( echo !line! )))
      ) else echo.
    )) > docu_constants.py.temp
    move /y docu_constants.py.temp storage_api\docu_rest\docu_rest_app\constants.py > nul

    echo INTERNAL_SECRET="!INTERNAL_SECRET!" > storage_api\docu_rest\docu_rest_app\internal_secret.py

    echo [OK] Storage server source files modified

    if [!MUST_COPY_DBS!] == [0] (
      del /s /q storage_api\database > nul
      rmdir /s /q storage_api\database
    )

    tar -cf backend_storage.tar storage_api
    del /s /q storage_api > nul
    rmdir /s /q storage_api

    echo [OK] backend_storage.tar generated

    echo Copying and modifying React App source files...

    robocopy code\frontend frontend /MIR > nul

    rem https://www.delftstack.com/howto/batch/batch-replace-text-from-file/
    (for /f "tokens=*" %%a in ('type frontend\src\client\Servers.js ^| findstr /n "^"') do (
      set "line=%%a"
      set "line=!line:*:=!"
      if defined line (
        if "!line!" == "const EDU_SERVER = 'http://localhost:8000'" ( echo const EDU_SERVER = 'https://!API_NAME!' ) else ( if "!line!" == "const DOCU_SERVER = 'http://localhost:8001'" ( echo const DOCU_SERVER = 'https://!DOCU_NAME!' ) else ( echo !line! ))
      ) else echo. 
    )) > Servers.js.temp
    move /y Servers.js.temp frontend\src\client\Servers.js > nul

    echo [OK] React app source files modified
    echo Building React app...

    REM important - after npm run build somehow the FOR loops that replace text don't work well. So this has to be executed at the end
    npm run build --prefix frontend

    robocopy frontend\build build /MIR > nul
    tar -cf frontend.tar build
    del /s /q build > nul
    rmdir /s /q build
    del /s /q frontend > nul
    rmdir /s /q frontend

    echo [OK] frontend.tar generated

    mkdir build
    move /y frontend.tar build/frontend.tar > nul
    move /y backend_rest.tar build/backend_rest.tar > nul
    move /y backend_storage.tar build/backend_storage.tar > nul

    echo [OK] All finished
    echo [INFO] You now have three zipped files under the build/ folder
    echo - [frontend.tar] React app. It should be uploaded and deployed to your main server
    echo - [backend_rest.tar] Django REST API (both the public and the internal^). It should be uploaded and deployed to your REST API server
    echo - [backend_storage.tar] Django storage server. It should be uploaded and deployed to another server too
    echo [INFO] For further information on how to do this, see doc\deployment.md
    echo [INFO] The two database/db.sqlite3 files have only been included into your backend_rest.tar and
    echo        backend_storage.tar if this was your first time running the script and generating build.config.
    echo ---
    echo Have a nice day!
    endlocal
    pause
  ) else (
    echo Exiting...
    exit
  )
)


