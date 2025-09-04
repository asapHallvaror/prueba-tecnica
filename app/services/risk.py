def calculate_risk(inputs: dict) -> int:
    score = 0
    if inputs.get("pep_flag"):
        score += 60
    if inputs.get("sanction_list"):
        score += 40
    late = inputs.get("late_payments", 0)
    score += min(late * 10, 30)
    return min(score, 100)  
