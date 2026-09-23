#!/bin/sh
# launchd 가 60초마다 부른다. 이 사본을 dev 로 맞춘 뒤 새 요청과 결정을 본다(watch-decisions.mjs 머리말 「설치」).
#
# 사본을 따로 두는 까닭은 macOS 다. launchd 가 띄운 프로그램은 `~/Desktop` 아래를 읽지 못한다(TCC,
# EPERM). 개발자의 clone 이 거기 있으므로, 감시는 보호 밖의 `~/.ooee-harness/harness` 사본에서 돈다.
cd "$(dirname "$0")/../.." || exit 0

# **러너가 돌고 있으면 아무것도 하지 않는다.** 아래의 맞춤은 사본의 working tree 를 건드리므로, 처리 중인
# 실행의 가지와 아직 commit 하지 않은 화면 파일이 날아간다. `2026-09-24` 에 개발자가 손으로 돌린 실행의
# 가지가 tick 마다 `origin/dev` 로 밀리고 있었다. launchd 는 같은 job 을 겹쳐 띄우지 않지만, 사람이 손으로
# 돌린 실행은 그 밖이라 겹친다.
if pgrep -f "scripts/harness/runner.mjs" > /dev/null 2>&1; then exit 0; fi

# `reset --hard` 가 아니라 `checkout -B` 다. 앞 실행이 남긴 feature 가지에 서 있을 때 reset 은 그 가지를
# origin/dev 로 밀어 버린다.
git fetch -q origin dev 2>/dev/null && git checkout -q -B dev origin/dev 2>/dev/null
exec node scripts/harness/watch-decisions.mjs
