# Models

This directory contains notebooks for running and evaluating speech models as part of the Counter-Radicalize project. It employs the suite of [Vox-Profile](https://github.com/tiantiaf0627/vox-profile-release) models that rely on [Whisper](https://huggingface.co/openai/whisper-large-v3)'s internal representation of speech as a basis for analyzing multidimensional dynamic traits of utterances, such as:
- **Categorical emotion**: anger, contempt, disgust, fear, happiness, sadness, surprise, neutral, other
- **Dimensional affect**:
  - Valence, emotional polarity (negative → positive)
  - Arousal, the intensity of the emotion (calm → excited)
  - Dominance, perceived level of control over the situation (submissive → empowered); it is what differentiates low valence, high arousal emotions like fear and anger
- **Speech flow** (or fluency), with disfluent sections categorized as:
  - Block, gasps for air or stuttered pauses
  - Prolongation, elongated syllable (“M[mmm]ommy”)
  - Sound repetition, repeated syllables (“I [pr-pr-pr-]prepared dinner”)
  - Word repetition (“I made [made] dinner”)
  - Interjection, filler words (“um”, “uh”, “you know”)

The training of these speech classification models was supervised and based on high-quality datasets. In particular, the emotion category and dimension model was trained on the [MSP-PODCAST](https://doi.org/10.1109/TAFFC.2017.2736999) corpus and the speech flow model on the [Sep-28K](https://doi.org/10.1109/ICASSP39728.2021.9413520) dataset, both consisting of podcast excerpts manually annotated. For a deeper understainding of the training approach you can refer to the Vox-Profile [paper preprint](https://doi.org/10.48550/arXiv.2505.14648).


## Alignment

```bash
mfa model download acoustic english_us_arpa
mfa model download dictionary english_us_arpa
mfa align_one --single_speaker --output_format json --clean --final_clean --overwrite inputs/rec_pre.mp3 outputs/transcript.txt english_us_arpa english_us_arpa outputs/alignment.json
```
