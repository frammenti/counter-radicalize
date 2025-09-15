import re
import json
import pandas as pd
import matplotlib.pyplot as plt

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

def _clean(text):
    text = re.sub(r"\bi\b|\bi(?=')", "I", text)
    text = re.sub(r"in Mendham", "Inmendham", text)
    text = re.sub(r"ivf", "IVF", text)
    return text

def clean_text(data):
    if isinstance(data, pd.Series):
        texts = data.apply(_clean)
        if not texts.iloc[-1].endswith('.'):
            texts.iloc[-1] = texts.iloc[-1] + '.'
        return texts
    else:
        text = _clean(data)
        if not text.endswith('.'):
            text += '.'
        return text

def display_by_duration(df):
    plt.figure(figsize=(8, 5))
    plt.bar(range(len(df)), sorted(df.duration, reverse=True))
    plt.xlabel('Number of segments')
    plt.ylabel('Duration (seconds)')
    plt.title('Descending Segment Duration')
    plt.tight_layout()
    plt.show()

def slice_range(end, step=1):
    i = 0
    while i < end:
        j = i + step
        if j >= end:
            yield i, end
            break
        yield i, j
        i += step

def to_nested_json(df, path):
    def to_template_json(index):
        root = {}
        for col in index:
            path = col.split('.')
            d = root
            for p in path[:-1]:
                d = d.setdefault(p, {})
            d[path[-1]] = '%s'
        return json.dumps(root)

    def cast_float(obj):
        out = {}
        for k, v in obj.items():
            try:
                out[k] = float(v)
            except:
                out[k] = v
        return out

    template = to_template_json(df.columns)
    result = [json.loads(template % tuple(row), object_hook=cast_float) for row in df.to_numpy()]
    
    with open(path, 'w') as f:
        json.dump(result, f)
