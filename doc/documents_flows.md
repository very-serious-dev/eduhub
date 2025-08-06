# Explanation of every flow that involves more than just communication between
# the HTTP client (React) and the main backend (Django's EduREST Public API)

* Upload document(s) from My Files page:
  1. React sends HTTP POST to DocuREST with files information and the parent folder id
  2. DocuREST talks to EduREST internal to assess user quota
  3. EduREST internal saves Documents in its database and returns quota limit is not
     exceeded (if it proceeds)
  4. DocuREST answers React with the info of the uploaded documents

* Delete document(s) from My Files page:
  1. React sends HTTP DELETE to DocuREST indicating either (a) a single document_id to delete
     or (b) a single folder_id and all of the children/grandchildren/etc. document_ids
     (Note that folders aren't something actually stored inside DocuREST)
  2. DocuREST asks EduREST internal to remove the (a) single document or (b) the single folder
     and then CASCADE the deletions, on behalf of the user
  3. DocuREST removes the documents from its database
  4. React receives DocuREST answer with info about deleted elements

* View document
  1. React sends HTTP GET to DocuREST
  2. DocuREST talks to EduREST internal to assess view permissions
  3. DocuREST replies to React with the file or a 403 Forbidden

* [As a teacher] Create a post inside a class with attached documents
  1. React sends HTTP POST to DocuREST to upload documents
  2. DocuREST talks to EduREST internal to assess user quota, but explicitly says: "hey,
     don't save the documents in your EduREST database now"
  3. If user quota isn't exceeded, DocuREST stores Documents in its database and returns
     identifiers to React client
  4. Now, React client sends HTTP POST to EduREST public API, stating the data of the post
     to be created, together with the documents' identifiers
  5. EduREST saves the information (creates Documents info too, containing the DocuREST
     identifiers) and returns a 201

  Note: A similar process might take place when amending a post (that's like creating a new post)

* [As a student] Create assignment submit
  Very similar to previous one

* Loging in (auth flow explained in depth in doc/auth_flow.txt)

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
