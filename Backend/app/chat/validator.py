from sqlglot import parse, exp

ALLOWED_TABLES = {
    "traces": {
        "id",
        "trace_id",
        "user_id",
        "api_key_id",
        "provider",
        "model",
        "prompt",
        "response",
        "latency_ms",
        "input_tokens",
        "output_tokens",
        "cost",
        "status",
        "error_message",
        "metadata_trace",
        "created_at",
    },

    "alerts": {
        "id",
        "user_id",
        "metric",
        "operator",
        "threshold_value",
        "window_minutes",
        "enabled",
        "cooldown_minutes",
        "last_triggered_at",
        "created_at",
    },

    "usage_limits": {
        "id",
        "user_id",
        "enabled",
        "max_requests_per_minute",
        "max_requests_per_hour",
        "max_requests_per_day",
        "max_input_tokens_per_day",
        "max_output_tokens_per_day",
        "max_cost_per_day",
        "block_on_limit",
        "created_at",
        "updated_at",
    },
}


USER_SCOPED_TABLES = {
    "traces",
    "alerts",
    "usage_limits",
}

FORBIDDEN_STATEMENTS = (
    exp.Insert,
    exp.Update,
    exp.Delete,
    exp.Drop,
    exp.Alter,
    exp.Create,
    exp.Merge,
    exp.Command,
)


def validate_sql(sql: str, user_id: int) -> bool:

    if not sql or not sql.strip():
        raise ValueError("SQL query is empty.")
    try:
        statements = parse(sql, read="postgres")
    except Exception:
        raise ValueError("Invalid SQL.")

    if len(statements) != 1:
        raise ValueError(
            "Only one SQL statement is allowed."
        )

    tree = statements[0]
    validate_statement(tree)
    tables = validate_tables(tree)
    validate_columns(tree, tables)
    validate_user_filter(
        tree=tree,
        tables=tables,
        user_id=user_id,
    )

    return True

def validate_statement(tree):

    # Root must be SELECT.

    if not isinstance(
        tree,
        (
            exp.Select,
            exp.Union,
        ),
    ):
        raise ValueError(
            "Only SELECT statements are allowed."
        )

    for stmt in FORBIDDEN_STATEMENTS:

        if tree.find(stmt):
            raise ValueError(
                f"{stmt.__name__} is not allowed."
            )

def validate_tables(tree):

    cte_names = {
        cte.alias_or_name.lower()
        for cte in tree.find_all(exp.CTE)
        if cte.alias_or_name
    }

    tables = []

    for table in tree.find_all(exp.Table):

        table_name = table.name.lower()

        # CTEs are temporary query sources, not real tables.
        if table_name in cte_names:
            continue

        if table_name not in ALLOWED_TABLES:
            raise ValueError(
                f"Access to table '{table.name}' is not allowed."
            )

        tables.append(table)

    if not tables:
        raise ValueError(
            "Query must access an allowed table."
        )

    return tables

def validate_columns(tree, tables):
    table_aliases = {}

    for table in tables:

        table_name = table.name.lower()

        aliases = {table_name}

        if table.alias:
            aliases.add(table.alias.lower())

        table_aliases[table_name] = aliases

    # -----------------------------------------------------
    # Derived column aliases
    #
    # Examples:
    #
    # COUNT(*) AS error_count
    # COUNT(*) AS total_requests
    # date_trunc(...) AS hour
    # -----------------------------------------------------

    derived_columns = set()

    for alias in tree.find_all(exp.Alias):

        if alias.alias:
            derived_columns.add(
                alias.alias.lower()
            )

    cte_names = {
        cte.alias_or_name.lower()
        for cte in tree.find_all(exp.CTE)
        if cte.alias_or_name
    }
    subquery_names = {
        subquery.alias_or_name.lower()
        for subquery in tree.find_all(exp.Subquery)
        if subquery.alias_or_name
    }

    derived_sources = (
        cte_names
        | subquery_names
    )

    for column in tree.find_all(exp.Column):

        column_name = column.name.lower()

        table_name = (
            column.table.lower()
            if column.table
            else None
        )


        if column_name in derived_columns:
            continue

        if table_name:

            matched_table = None

            for real_table, aliases in table_aliases.items():

                if table_name in aliases:

                    matched_table = real_table
                    break

            if matched_table:

                if (
                    column_name
                    not in ALLOWED_TABLES[matched_table]
                ):
                    raise ValueError(
                        f"Column '{column.name}' "
                        f"is not allowed."
                    )

                continue


            if table_name in derived_sources:
                continue

            raise ValueError(
                f"Column '{column.name}' "
                f"is not allowed."
            )

        if any(
            column_name in ALLOWED_TABLES[
                table.name.lower()
            ]
            for table in tables
        ):
            continue


        if column_name in derived_columns:
            continue

        raise ValueError(
            f"Column '{column.name}' "
            f"is not allowed."
        )

def validate_user_filter(
    tree,
    tables,
    user_id: int,
):

    referenced_tables = {
        table.name.lower()
        for table in tables
    }

    user_scoped_tables = (
        referenced_tables
        & USER_SCOPED_TABLES
    )

    if not user_scoped_tables:
        raise ValueError(
            "Query does not access a user-scoped table."
        )


    for table_name in user_scoped_tables:

        if not table_has_user_filter(
            tree,
            table_name,
            user_id,
        ):
            raise ValueError(
                f"Query must filter "
                f"'{table_name}.user_id' "
                f"by the authenticated user."
            )


def table_has_user_filter(
    tree,
    table_name: str,
    user_id: int,
) -> bool:

    # Build aliases for this table.
    aliases = {
        table_name,
    }

    for table in tree.find_all(exp.Table):

        if table.name.lower() == table_name:

            if table.alias:
                aliases.add(
                    table.alias.lower()
                )

    for eq in tree.find_all(exp.EQ):

        left = eq.left
        right = eq.right

        # We want:
        #
        # user_id = 3
        #
        # or:
        #
        # traces.user_id = 3
        #
        # or:
        #
        # t.user_id = 3

        if not (
            isinstance(left, exp.Column)
            and left.name.lower() == "user_id"
        ):
            continue


        # Check table qualification if present
        if left.table:

            if left.table.lower() not in aliases:
                continue
        # Check authenticated user ID
        if isinstance(right, exp.Literal):

            if (
                not right.is_string
                and str(right.this) == str(user_id)
            ):
                return True

    return False