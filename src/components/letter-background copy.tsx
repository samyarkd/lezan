import React, { type ReactNode, useEffect, useRef } from "react";

// You can create a separate CSS file or use inline styles

const LetterBackground: React.FC<{ children?: ReactNode }> = (props) => {
  const backgroundRef = useRef<HTMLDivElement>(null); // Ref to the background div
  const characters =
    "abcdefghijklmnopqrstuvwxyz" + // English
    "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ" + // Korean (Hangul consonants)
    "あいうえおカキクケコさしすせそたちつてとなにぬねの" + // Japanese (Hiragana & Katakana - a few examples)
    useEffect(() => {
      const background = backgroundRef.current;
      if (!background) return; // Ensure ref is attached

      const numberOfLetters = 70; // Adjust as needed

      for (let i = 0; i < numberOfLetters; i++) {
        const letterSpan = document.createElement("span");
        letterSpan.classList.add("letter"); // Class for CSS styling
        letterSpan.textContent = characters.charAt(
          Math.floor(Math.random() * characters.length),
        );

        const x = Math.random() * 100;
        const y = Math.random() * 100;

        letterSpan.style.left = `${x}vw`;
        letterSpan.style.top = `${y}vh`;
        letterSpan.style.fontSize = `${1 + Math.random() * 0.3}em`;
        letterSpan.style.transform = `rotate(${Math.random() * 45}deg`;

        background.appendChild(letterSpan);
      }
    }, []); // Empty dependency array means this effect runs only once after initial render

  return (
    <>
      <div
        className="fixed backdrop-blur-2xl top-0 left-0 w-full h-full overflow-hidden z-[-1] font-playful text-neutral-500"
        ref={backgroundRef}
      >
        {/* Letters will be appended here */}
        <style>{`
        .letter {
          position: absolute;
          user-select: none;
        }
      `}</style>
      </div>
      {props.children}
    </>
  );
};

export default LetterBackground;
