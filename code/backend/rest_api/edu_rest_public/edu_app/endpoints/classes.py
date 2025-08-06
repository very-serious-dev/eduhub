import random
from datetime import datetime
from django.http import JsonResponse, HttpResponse
from ..models import User, Class, UserClass, Group, Unit, Post, PostDocument, AssignmentSubmit, Announcement, PostQuestionnaire
from ..util.exceptions import Forbidden, ConflictUnitAlreadyExists
from ..util.helpers import get_from_db, can_see_class, can_edit_class
from ..util.serializers import groups_array_to_json, users_array_to_json, class_detail_to_json, class_theme, document_to_json, post_kind, questionnaire_to_json

def get_my_classes(request):
    user_classes = UserClass.objects.filter(user=request.session.user, classroom__archived=False).select_related('classroom', 'classroom__group')
    classes = list(map(lambda uc: uc.classroom, user_classes))
    distinct_groups = {}
    classes_json = []
    groups_json = []
    for c in classes:
        classes_json.append({
            "id": c.id,
            "name": c.name,
            "group_id": c.group_id,
            "theme": class_theme(c),
            "latest_update": __get_latest_class_update(c)
        })
        distinct_groups[c.group.id] = c.group
    for g in distinct_groups.values():
        groups_json.append({
            "id": g.id,
            "tag": g.tag,
            "name": g.name,
            "year": g.year,
            "latest_update": __get_latest_announcements_update(g)
        })
    return JsonResponse({"classes": classes_json, "groups": groups_json})

def create_class(request, name, group_id, automatically_add_teacher):
    group = get_from_db(Group, id=group_id, archived=False)
    new_class = Class()
    new_class.name = name
    new_class.evaluation_criteria = None
    new_class.group = group
    new_class.theme = __class_theme_for_new_class(group)
    new_class.save()
    if automatically_add_teacher is True:
        new_user_class_teacher = UserClass()
        new_user_class_teacher.user = request.session.user
        new_user_class_teacher.classroom = new_class
        new_user_class_teacher.save()
    # Automatically add to the new class all users belonging to the corresponding group
    user_class_objects = []
    for u in User.objects.filter(student_group=group):
        user_class_objects.append(UserClass(user=student, classroom=new_class))
        UserClass.objects.bulk_create(user_class_objects)
    return JsonResponse({"success": True}, status=201)

def get_class(request, c_id, only_newer_than_post_with_id):
    classroom = get_from_db(Class, id=c_id)
    if not can_see_class(request.session.user, classroom):
        raise Forbidden
    units = list(Unit.objects.filter(classroom=classroom).order_by("name").values('id', 'name'))
    posts_query = Post.objects.filter(classroom=classroom)
    if only_newer_than_post_with_id is not None:
        posts_query = posts_query.filter(id__gt=only_newer_than_post_with_id)
    posts_query = posts_query.prefetch_related(
        'postdocument_set__document',
        'postquestionnaire_set__questionnaire',
        'author')
    posts = []
    for p in posts_query:
        post_documents = PostDocument.objects.filter(post=p)
        files = list(map(lambda pd: document_to_json(pd.document), post_documents))
        post_questionnaires = PostQuestionnaire.objects.filter(post=p)
        questionnaires = list(map(lambda pq: questionnaire_to_json(pq.questionnaire), post_questionnaires))
        for f in files:
            f["type"] = "document"
        for q in questionnaires:
            q["type"] = "questionnaire"
        posts.append({
            "id": p.id,
            "title": p.title,
            "content": p.content,
            "author": p.author.username,
            "publication_date": p.publication_date,
            "attachments": files + questionnaires,
            "kind": post_kind(p),
            "assignment_due_date": p.assignment_due_date,
            "unit_id": p.unit.id if p.unit else None,
            "amended_post_id": p.amendment_original_post.id if p.amendment_original_post else None
        })
    return JsonResponse(class_detail_to_json(classroom, units, posts, can_edit_class(request.session.user, classroom)))

def edit_class(request, c_id, name, evaluation_criteria):
    classroom = get_from_db(Class, id=c_id)
    if not can_edit_class(request.session.user, classroom):
        raise Forbidden
    classroom.name = name
    if evaluation_criteria is not None:
        # Only update evaluation_criteria if it comes in the JSON body.
        # In admin panel you can edit the class with a form without
        # evaluation criteria (admins can't change that from the UI)
        classroom.evaluation_criteria = evaluation_criteria
    classroom.save()
    return JsonResponse({"success": True}, status=200)

def delete_class(request, c_id):
    classroom = get_from_db(Class, id=c_id)
    if not can_edit_class(request.session.user, classroom):
        raise Forbidden
    classroom.archived = True
    classroom.save()
    return JsonResponse({"success": True}, status=200)

def get_participants(request, c_id):
    classroom = get_from_db(Class, id=c_id)
    if not can_see_class(request.session.user, classroom):
        raise Forbidden
    users_class = UserClass.objects.filter(classroom=classroom, user__archived=False)
    users = list(map(lambda uc: uc.user, users_class))
    return JsonResponse({"users": users_array_to_json(users)}, status=200)

def add_participants(request, c_id, usernames):
    classroom = get_from_db(Class, id=c_id)
    if not can_edit_class(request.session.user, classroom):
        raise Forbidden
    failed_inexistent_users = []
    failed_already_added_users = []
    for username in usernames:
        try:
            user = User.objects.get(username=username, archived=False)
            if UserClass.objects.filter(user=user, classroom=classroom).exists():
                failed_already_added_users.append(username)
            else:
                new_user_class = UserClass()
                new_user_class.user = user
                new_user_class.classroom = classroom
                new_user_class.save()
        except User.DoesNotExist:
            failed_inexistent_users.append(username)
    if len(failed_inexistent_users) == 0 and len(failed_already_added_users) == 0:
        return JsonResponse({"success": True}, status=201)
    else:
        error_msg = ""
        if len(failed_inexistent_users) > 0:
            error_msg += "Usuario(s) inexistente(s): " + ", ".join(failed_inexistent_users) + ". "
        if len(failed_already_added_users) > 0:
            error_msg += "Usuario(s) ya pertenece(n) a la clase: " + ", ".join(failed_already_added_users)
        return JsonResponse({"partial_success": True, "error": error_msg}, status=201)

def delete_participant(request, c_id, username):
    classroom = get_from_db(Class, id=c_id)
    if not can_edit_class(request.session.user, classroom):
        raise Forbidden
    user_class = get_from_db(UserClass, classroom=classroom, user__username=username, user__archived=False)
    user_class.delete()
    return JsonResponse({"success": True}, status=200)

def create_unit(request, c_id, name):
    classroom = get_from_db(Class, id=c_id)
    if not can_edit_class(request.session.user, classroom):
        raise Forbidden
    if Unit.objects.filter(classroom=classroom, name=name).exists():
        raise ConflictUnitAlreadyExists
    new_unit = Unit()
    new_unit.name = name
    new_unit.classroom = classroom
    new_unit.save()
    return JsonResponse({"success": True}, status=201)

def edit_unit(request, u_id, name):
    unit = get_from_db(Unit, id=u_id)
    if not can_edit_class(request.session.user, unit.classroom):
        raise Forbidden
    if Unit.objects.filter(name=name, classroom=unit.classroom).exists():
        raise ConflictUnitAlreadyExists
    unit.name = name
    unit.save()
    return JsonResponse({"success": True}, status=200)

def delete_unit(request, u_id):
    unit = get_from_db(Unit, id=u_id)
    if not can_edit_class(request.session.user, unit.classroom):
        raise Forbidden
    unit.delete()
    return JsonResponse({"success": True}, status=200)

def download_scores(request, c_id):
    classroom = get_from_db(Class, id=c_id)
    if not can_edit_class(request.session.user, classroom):
        raise Forbidden
    csv = ""
    original_assignments = Post.objects.filter(classroom=classroom, kind=Post.PostKind.ASSIGNMENT)
    assignments = []
    for oa in original_assignments:
        assignment_real_title = oa.title
        if Post.objects.filter(amendment_original_post=oa).exists():
            newest_amendment = Post.objects.filter(amendment_original_post=oa).order_by("-id")[0]
            if newest_amendment.kind == Post.PostKind.AMENDMENT_DELETE:
                continue
            elif newest_amendment.kind == Post.PostKind.AMENDMENT_EDIT:
                assignment_real_title = newest_amendment.title
        assignments.append({"assignment": oa, "real_title": assignment_real_title})
    for a in assignments:
        csv += ',"' + a["real_title"] + '"' # Enclose title in double quotes to handle possible commas in the title (RFC 4180)
                                            # Double quotes in title are simply not allowed
    csv += "\n"
    students_class = UserClass.objects.filter(classroom=classroom, user__archived=False, user__role__in=[User.UserRole.STUDENT]).order_by("user__surname")
    students = list(map(lambda sc: sc.user, students_class))
    for s in students:
        csv += '"'+ s.surname + ', ' + s.name + '"'
        for a in assignments:
            try:
                submit = AssignmentSubmit.objects.get(author=s, assignment=a["assignment"], score__isnull=False)
                score = submit.score
            except AssignmentSubmit.DoesNotExist:
                score = ""
            csv += "," + str(score)
        csv += "\n"
    response = HttpResponse(csv, content_type="text/csv")
    response["Content-Disposition"] = "filename=Notas de " + classroom.name + " [" + classroom.group.tag + "] (" + datetime.today().strftime('%d-%m-%Y') + "]";
    return response

def __class_theme_for_new_class(group):
    """
    Students belong to a group and predictably will belong to all (or most)
    of the group's classes.

    We want students to see classes with different themes so that their
    home screen is more diverse.

    Thus, we will try to choose a theme for new class trying to avoid
    themes already in use for classes belonging to the same group.
    """
    INFINITE = 1000
    used_themes_count = {}
    less_used_theme_count = INFINITE
    for theme in Class.ClassTheme:
        n_times_used = Class.objects.filter(group=group, archived=False, theme=theme).count()
        used_themes_count[theme] = n_times_used
        if n_times_used < less_used_theme_count:
            less_used_theme_count = n_times_used
    """
    At this point we have a dictionary saying how many themes are in use
    for the classes of a group. For this scenario:

    (Let's imagine that only the themes RED, GREEN and BLUE exist)

    GROUP: Science
            |
            |-- Maths        RED
            |-- Engineering  GREEN
            |-- Physics      BLUE
            |-- Biology      RED
    
    ...we would have:

    {
      RED: 2,
      GREEN: 1,
      BLUE: 1
    {
    
    And now we transform it into a normalized dictionary:

    {
      RED: 1,
      GREEN: 0,
      BLUE: 0
    {
    """
    for theme in Class.ClassTheme:
        used_themes_count[theme] = used_themes_count[theme] - less_used_theme_count
    """
    And finally we choose among the least used ones - GREEN and BLUE in the example
    """
    least_used_themes = []
    for theme in Class.ClassTheme:
        if used_themes_count[theme] == 0:
            least_used_themes.append(theme)
    return random.choice(least_used_themes)

def __get_latest_class_update(classroom):
    if Post.objects.filter(classroom=classroom).exists():
        latest_post = Post.objects.filter(classroom=classroom).order_by("-id")[0]
        return latest_post.publication_date
    else:
        return "never"

def __get_latest_announcements_update(group):
    if Announcement.objects.filter(group=group).exists():
        latest_announcement = Announcement.objects.filter(group=group).order_by("-id")[0]
        return latest_announcement.publication_date
    else:
        return "never"
