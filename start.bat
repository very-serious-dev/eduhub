@echo off
setlocal enabledelayedexpansion

echo TODO: Should say something about logo_main.png and generate internal_secret.py when building
echo 1) Start development servers on local machine
echo 2) Build web applications for deployment
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
    if not exist code\backend\rest_api\edu_rest_public\edu_app\middleware_cors.py ( echo I couldn't find edu_app\middleware_cors.py... Aborting... && pause && exit -1 )
    if not exist code\backend\rest_api\edu_rest_internal\edu_rest_internal\settings.py ( echo I couldn't find edu_rest_internal\settings.py... Aborting... && pause && exit -1 )
    if not exist code\backend\storage_api\docu_rest\docu_rest\settings.py ( echo I couldn't find docu_rest\settings.py... Aborting... && pause && exit -1 )
    if not exist code\backend\storage_api\docu_rest\docu_rest_app\middleware_cors.py ( echo I couldn't find docu_rest_app\middleware_cors.py... Aborting... && pause && exit -1 )
    if not exist code\backend\storage_api\docu_rest\docu_rest_app\endpoints.py ( echo I couldn't find docu_rest_app\endpoints.py... Aborting... && pause && exit -1 )

    echo [OK] Source files that need to be modified during build exist. Moving on...

    if not exist build.config (
      set MUST_COPY_DBS=1
      echo [INFO] It looks that this is your first time making a build for deployment.
      echo For further information about the intented 3-servers architecture, see doc\deployment.md
      echo ---
      echo Now I'm going to ask you some questions and I will generate a build.config file
      set /p EDU_NAME="What is your main server name (React)? "
      echo EDU_NAME=!EDU_NAME!> build.config
      set /p API_NAME="What your REST API public server name? "
      echo API_NAME=!API_NAME!>> build.config
      set /p API_INTERNAL_NAME="What is your internal REST API (private interface) name or IP? (add any port if needed, e.g. 192.168.0.5:1234) "
      echo API_INTERNAL_NAME=!API_INTERNAL_NAME!>> build.config
      set /p DOCU_NAME="What is your storage server name? "
      echo DOCU_NAME=!DOCU_NAME!>> build.config
      echo Your storage server needs to communicate with your REST API server.
      echo If you have installed a self-signed certificate into the REST API server
      echo internal interface, then you must have safely copied the public key into
      echo the storage server.
      set /p API_INTERNAL_CERT_PATH_IN_DOCU="Where's the path to the self-signed certificate containing the public key? (e.g. /etc/ssl/certs/internal.crt, you can also specify None) "
      echo API_INTERNAL_CERT_PATH_IN_DOCU=!API_INTERNAL_CERT_PATH_IN_DOCU!>> build.config
    ) else (
      set MUST_COPY_DBS=0
      echo [INFO] Using previously generated build.config...
      for /f "tokens=1,2* delims==" %%a in (build.config) do (
        if [%%a] == [EDU_NAME] (set EDU_NAME=%%b)
        if [%%a] == [API_NAME] (set API_NAME=%%b)
        if [%%a] == [API_INTERNAL_NAME] (set API_INTERNAL_NAME=%%b)
        if [%%a] == [DOCU_NAME] (set DOCU_NAME=%%b)
        if [%%a] == [API_INTERNAL_CERT_PATH_IN_DOCU] (set API_INTERNAL_CERT_PATH_IN_DOCU=%%b)
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

    (for /f "tokens=*" %%a in ('type rest_api\edu_rest_public\edu_app\middleware_cors.py ^| findstr /n "^"') do (
      set "line=%%a"
      set "line=!line:*:=!"
      if defined line (
        if "!line!" == "ORIGIN_SERVER='http://localhost:3000'" ( echo ORIGIN_SERVER='https://!EDU_NAME!' ) else ( echo !line! )
      ) else echo:
    )) > edu_cors.py.temp
    move /y edu_cors.py.temp rest_api\edu_rest_public\edu_app\middleware_cors.py > nul

    (for /f "tokens=*" %%a in ('type rest_api\edu_rest_internal\edu_rest_internal\settings.py ^| findstr /n "^"') do (
      set "line=%%a"
      set "line=!line:*:=!"
      if defined line (
        if "!line!" == "ALLOWED_HOSTS = []" ( echo ALLOWED_HOSTS = ["!API_INTERNAL_NAME_WITHOUT_PORT!"] ) else ( if "!line!" == "DEBUG = True" ( echo DEBUG = False ) else ( echo !line! ))
      ) else echo. 
    )) > edu_int_settings.py.temp
    move /y edu_int_settings.py.temp rest_api\edu_rest_internal\edu_rest_internal\settings.py > nul

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

    (for /f "tokens=*" %%a in ('type storage_api\docu_rest\docu_rest_app\middleware_cors.py ^| findstr /n "^"') do (
      set "line=%%a"
      set "line=!line:*:=!"
      if defined line (
        if "!line!" == "ORIGIN_SERVER='http://localhost:3000'" ( echo ORIGIN_SERVER='https://!EDU_NAME!' ) else ( echo !line! )
      ) else echo:
    )) > docu_cors.py.temp
    move /y docu_cors.py.temp storage_api\docu_rest\docu_rest_app\middleware_cors.py > nul

    (for /f "tokens=*" %%a in ('type storage_api\docu_rest\docu_rest_app\endpoints.py ^| findstr /n "^"') do (
      set "line=%%a"
      set "line=!line:*:=!"
      if defined line (
        if "!line!" == "EDU_REST_INTERNAL_CERTIFICATE=None" ( echo EDU_REST_INTERNAL_CERTIFICATE='!API_INTERNAL_CERT_PATH_IN_DOCU!' ) else ( echo !line! )
      ) else echo:
    )) > docu_endpoints.py.temp
    move /y docu_endpoints.py.temp storage_api\docu_rest\docu_rest_app\endpoints.py > nul

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
    echo Invalid option. Exiting...
    pause
    exit -1
  )
)


