@app.route('/token_usage', methods=['GET'])
@db_session
def token_usage():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
    except ValueError:
        return jsonify({'error': 'Invalid page or per_page parameter'}), 400

    first_name_filter = request.args.get('first_name')
    date_filter = request.args.get('date')
    model_filter = request.args.get('model')
    department_filter = request.args.get('department')

    query = select(t for t in TokenUsage)

    if first_name_filter:
        query = query.where(lambda t: t.Uid.FirstName == first_name_filter)

    if date_filter:
        query = query.where(lambda t: t.UsageTimestamp.date() == datetime.strptime(date_filter, '%Y-%m-%d').date())

    if model_filter:
        query = query.where(lambda t: t.ModelName == model_filter)

    if department_filter:
        query = query.where(lambda t: t.Uid.DeptId.DeptName == department_filter)

    total_records = query.count()
    usage_records = query.order_by(desc(TokenUsage.UsageTimestamp))[(page - 1) * per_page: page * per_page]

    response_data = [{
        'FirstName': usage.Uid.FirstName,
        'LastName': usage.Uid.LastName,
        'Email': usage.Uid.Email,
        'UsageTimestamp': usage.UsageTimestamp,
        'TokensUsed': usage.TokensUsed,
        'PromptTokens': usage.PromptTokens,
        'CompletionTokens': usage.CompletionTokens,
        'ModelName': usage.ModelName,
        'TotalCost': usage.TotalCost,
        'Department': usage.Uid.DeptId.DeptName
    } for usage in usage_records]

    if date_filter:
        total_tokens_used = sum(usage.TokensUsed for usage in query)
        total_prompt_tokens = sum(usage.PromptTokens for usage in query)
        total_completion_tokens = sum(usage.CompletionTokens for usage in query)
        total_successful_requests = sum(usage.SuccessfulRequests for usage in query)
        summary = {
            'total_tokens_used': total_tokens_used,
            'total_prompt_tokens': total_prompt_tokens,
            'total_completion_tokens': total_completion_tokens,
            'total_successful_requests': total_successful_requests
        }
    else:
        summary = None

    departments = [d.DeptName for d in Department.select()]

    return jsonify({
        'total_records': total_records,
        'page': page,
        'per_page': per_page,
        'data': response_data,
        'summary': summary,
        'departments': departments
    }), 200
