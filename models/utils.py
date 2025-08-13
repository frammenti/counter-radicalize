def join_segments(durations, threshold=3.0):
    group_id = 0
    total = 0.0
    ids = []
    for dur in durations:
        total += dur
        ids.append(group_id)
        if total > threshold:
            group_id += 1
            total = 0.0
    if durations.iloc[-1] <= threshold:
        ids[-1] = ids[-2]
    return ids

def slice_range(end, step=1):
    i = 0
    while i < end:
        j = i + step
        if j >= end:
            yield i, end
            break
        yield i, j
        i += step
