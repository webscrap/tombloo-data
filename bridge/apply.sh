#!/bin/sh

for i in *.txt ; do
	echo "Processing $i..."
	echo -e "\n<profd>:" >>"$i";
	echo -e "\t$HOME/.mozilla/firefox/profiles/afun/" >>"$i";
	perl /myplace/workspace/perl/tombloo-bridge.pl "$i"
done
