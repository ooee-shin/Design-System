#!/bin/sh
# launchd 가 60초마다 부른다. 이 사본을 dev 로 맞춘 뒤 결정을 본다(watch-decisions.mjs 머리말 「설치」).
#
# 사본을 따로 두는 까닭은 macOS 다. launchd 가 띄운 프로그램은 `~/Desktop` 아래를 읽지 못한다(TCC,
# EPERM). 개발자의 clone 이 거기 있으므로, 감시는 보호 밖의 `~/.ooee-harness/harness` 사본에서 돈다.
cd "$(dirname "$0")/../.." || exit 0
git fetch -q origin dev 2>/dev/null && git reset -q --hard origin/dev 2>/dev/null
exec node scripts/harness/watch-decisions.mjs
