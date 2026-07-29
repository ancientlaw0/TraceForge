# FORBIDDEN_KEYWORDS = {
#     "INSERT",
#     "UPDATE",
#     "DELETE",
#     "DROP",
#     "ALTER",
#     "CREATE",
#     "TRUNCATE",
#     "GRANT",
#     "REVOKE",
# }


# def validate_sql(sql: str, user_id: int):

#     sql_upper = sql.upper()

#     # Must be SELECT
#     if not sql_upper.strip().startswith("SELECT"):
#         raise ValueError("Only SELECT queries are allowed.")

#     # Block dangerous commands
#     for keyword in FORBIDDEN_KEYWORDS:
#         if keyword in sql_upper:
#             raise ValueError(f"{keyword} is not allowed.")

#     # Block api_keys table
#     if "API_KEYS" in sql_upper:
#         raise ValueError("Access to api_keys is forbidden.")

#     # Must contain correct user_id
#     if f"USER_ID = {user_id}" not in sql_upper:
#         raise ValueError("Query must filter by authenticated user.")

#     return True

## rathere thann this long mehenat what we can validate it by using sqlglot it helps to parse the sql and check if it is valid or not and also we can check if it is select statement or not and also we can check if it is using the correct user_id or not
from sqlglot import parse_one, exp

FORBIDDEN_TABLES = {
    "api_keys",
}

FORBIDDEN_STATEMENTS = (
    exp.Insert,
    exp.Update,
    exp.Delete,
    exp.Drop,
    exp.Alter,
    exp.Create,
)

def validate_sql(sql: str, user_id: int):

    try:
        tree = parse_one(sql, read="postgres")
    except Exception:
        raise ValueError("Invalid SQL.")

    validate_statement(tree)
    validate_tables(tree)
    validate_user_filter(tree, user_id)

    return True


def validate_statement(tree):

    if not isinstance(tree, exp.Select):
        raise ValueError("Only SELECT statements are allowed.")

    for stmt in FORBIDDEN_STATEMENTS:
        if tree.find(stmt):
            raise ValueError(f"{stmt.__name__} is not allowed.")


def validate_tables(tree):

    for table in tree.find_all(exp.Table):
        if table.name.lower() in FORBIDDEN_TABLES:
            raise ValueError(
                f"Access to '{table.name}' is forbidden."
            )

def validate_user_filter(tree, user_id):

    where = tree.args.get("where")

    if where is None:
        raise ValueError("Missing WHERE clause.")

    if not contains_user_filter(where.this, user_id):
        raise ValueError(
            "Query must filter by authenticated user."
        )

def contains_user_filter(node, user_id):

    if isinstance(node, exp.EQ):

        left = node.left
        right = node.right

        if (
            isinstance(left, exp.Column)
            and left.name.lower() == "user_id"
            and isinstance(right, exp.Literal)
            and str(right.this) == str(user_id)
        ):
            return True

    for child in node.args.values():

        if isinstance(child, list):
            for c in child:
                if isinstance(c, exp.Expression):
                    if contains_user_filter(c, user_id):
                        return True

        elif isinstance(child, exp.Expression):
            if contains_user_filter(child, user_id):
                return True

    return False