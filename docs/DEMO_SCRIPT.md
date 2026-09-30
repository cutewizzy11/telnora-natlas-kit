# Demo video script (target 3:30, limit 5:00)

Speak at an easy pace, about 150 words a minute. The full narration below is roughly 520 words.

## Before you press record
- Colab notebook is **running** and shows the Base URL and API key. Copy both somewhere handy (Notepad).
- Tabs open, in this order: 1) Colab, 2) https://telnora-natlas-kit.vercel.app/tutor, 3) the home page, 4) the GitHub repo, 5) the docs page.
- Tutor page: click "Model connection", choose "My N-ATLAS endpoint", paste the URL and key **before recording** and hide the key when recording (do not show it on screen).
- Close notifications. Test your microphone. Do one voice test in the tutor.
- Prompts to use: Explain a topic -> "how photosynthesis works" (JSS). Quiz me -> "fractions". Voice question -> "What is the difference between a noun and a verb?"
- Do not ask factual lookups (prices, news, dates). The model can invent specifics.

## Script

**[0:00 - 0:30] Hook and problem** (screen: home page)
"Hello, we are Telnora Technologies, a product agency in Abuja. N-ATLAS is Nigeria's own open language model, and that's a big deal. But if you're a developer, the weights are only the start. You still have to serve the model, handle streaming and retries, capture and transcribe voice, and build a chat interface. Every team repeats that work. So we built the Telnora N-ATLAS Kit to remove it."

**[0:30 - 1:10] Step one: get a model running** (screen: Colab notebook)
"Here's how a developer starts. This is a free Google Colab notebook from our repo. You accept the N-ATLAS licence on Hugging Face, paste a read token, and press Run all. It loads N-ATLAS in four-bit so it fits a free GPU, loads the Nigerian-accented English speech model, and opens a secured public URL with an API key. That takes about fifteen minutes and costs nothing."

**[1:10 - 2:10] Step two: build something real** (screen: tutor page)
"To show how little code you need, we built an EdTech tutor with our SDK. It's about a hundred lines. I choose Basic Science, JSS level, and ask it to explain photosynthesis."
*(type the topic, press Ask, let the answer stream)*
"The answer streams in token by token. Now I'll switch to Quiz me on fractions."
*(press Quiz me, type fractions, Ask)*
"Three multiple-choice questions, ready for a student. Our SDK handles the retries, the timeouts and the error messages, so the app code stays simple."

**[2:10 - 2:50] Voice** (screen: tutor page)
"Many users would rather talk than type. This is our voice component. I press Record and ask: what is the difference between a noun and a verb?"
*(record, stop, show the transcript appear, press Ask)*
"The recording goes to the N-ATLAS Nigerian-accented English model, and the transcript lands in the box, ready to send."

**[2:50 - 3:25] The toolkit** (screen: repo, then docs page)
"Everything is open source under the MIT licence. There's a TypeScript SDK and a Python SDK with no dependencies, twelve unit tests, React components, this documentation with a zero-to-first-call quickstart, and deployment recipes. We follow the N-ATLAS licence, with attribution to Awarri Technologies and the Federal Ministry, and we're clear about limits: the model can invent details, and the full-size model needs a bigger GPU than a free Colab."

**[3:25 - 3:45] Close** (screen: home page)
"Next we're running beta tests with outside developers, and we'll publish the packages to npm and PyPI. Any Nigerian developer or agency should be able to add N-ATLAS to a product in an afternoon. The repo and the live demo are linked below. Thank you."

## Recording tips
- Windows: Win+Alt+R (Game Bar) or OBS Studio. Record the browser window, not the whole desktop.
- If a take goes wrong, just pause a second and repeat the sentence; trim later or keep it.
- Upload to YouTube as **Unlisted**. Put the repo and demo URLs in the description.
- Replace this video with a final cut later, adding the beta-test results, once you have them.
