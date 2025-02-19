<template>
    <section class="flex min-h-screen">
        <article class="flex-1 flex justify-center items-center bg-white">
            <div class="w-[500px] rounded-md flex flex-col gap-12 px-4 py-16">
                <div class="text-center grid gap-2">
                    <Typography variant="h2" class="text-3xl"
                        >회원가입</Typography
                    >
                    <Typography variant="body02" class="text-xs"
                        >Charlie 서비스에 오신걸 환영합니다</Typography
                    >
                </div>
                <div class="px-8 flex flex-col gap-16">
                    <div class="flex flex-col gap-2">
                        <div>
                            <label>
                                <p class="text-xs mb-1">아이디</p>
                                <input
                                    type="text"
                                    placeholder="아이디를 입력하세요"
                                    class="w-full px-4 py-4 bg-zinc-100 rounded-md text-slate-800 placeholder:text-zinc-300 text-xs outline-none"
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                <p class="text-xs mb-1">비밀번호</p>
                                <input
                                    type="password"
                                    placeholder="영문, 숫자, 특수기호를 포함하여 8~16자를 입력하세요"
                                    class="w-full px-4 py-4 bg-zinc-100 rounded-md text-slate-800 placeholder:text-zinc-300 text-xs outline-none"
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                <p class="text-xs mb-1">비밀번호 확인</p>
                                <input
                                    type="password"
                                    placeholder="비밀번호를 한번 더 입력하세요"
                                    class="w-full px-4 py-4 bg-zinc-100 rounded-md text-slate-800 placeholder:text-zinc-300 text-xs outline-none"
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                <p class="text-xs mb-1">이름</p>
                                <input
                                    type="text"
                                    placeholder="이름을 입력하세요"
                                    class="w-full px-4 py-4 bg-zinc-100 rounded-md text-slate-800 placeholder:text-zinc-300 text-xs outline-none"
                                />
                            </label>
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            class="w-full text-md py-4 bg-rose-500 text-white font-bold"
                        >
                            회원가입
                        </button>
                        <p class="text-xs mt-2 text-end">
                            계정이 이미 있으신가요?
                            <router-link
                                class="text-rose-500 font-bold"
                                to="/sign-in"
                                >로그인</router-link
                            >
                        </p>
                    </div>
                </div>
            </div>
        </article>
        <article class="flex-1 flex justify-center items-center bg-rose-500">
            <Typography variant="h1" class="font-black text-white"
                >GNEWSOFT
            </Typography>
        </article>
    </section>
</template>
<script setup lang="ts"></script>
