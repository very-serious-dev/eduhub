# Auth flow explained:
#                                                                  Backend 
#
#  __________________________________                  ______________________
# | <Server A>                       |_________   (4) | <Server B>           |
# |                                  | EduREST | ←--- |                      |
# | Database containing users,       | internal| ---→ | Database containing  |
# | sessions, classes, assignments,  |_________|  (5) | documents raw data   |
# | files permissions, etc.          |                |                      |
# |__________________________________|                |______________________|
#        | EduREST Public |                              | DocuREST |
#        |________________|                              |__________|
#
#            ↑  |                                  _________↑     |
#            |  |                                 |               |
#         (1)|  |(2)                           (3)|    ___________|(6)
# -  -  -  - |- | -  -  -  -  -  -  -  -  -  -  - | - |-  -  -  -  -  -  - 
#            |  |                                 |   |
#            |  |                                 |   |
#            |  ↓                                 |   ↓          Frontend
#  ______________________________________________________
# |                                                      |
# | Webpage JS making HTTP requests                      |
# |                                                      |
# | This webpage is loaded from a <Server C> (React app) |
# |______________________________________________________|
#
# 1. POST /api/v1/sessions
#    JSON body: username and password
#
# 2. 201
#    Set-Cookie (HttpOnly) session token for EduREST
#    JSON response: one_time_token
#
# 3. POST /api/v1/sessions
#    JSON body: one_time_token
#
#    4. POST /internal/v1/sessions
#       JSON body: one_time_token and internal secret
#
#    5. 200
#       JSON response: user_id
#
# 6. 201
#    Set-Cookie (HttpOnly) session token for DocuREST